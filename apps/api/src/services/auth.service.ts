import { randomBytes, randomUUID } from "node:crypto";
import { env } from "../config/env";
import { AppError } from "../lib/app-error";
import { hashPassword, verifyPassword } from "../lib/password";
import { prismaSessionRepository } from "../repositories/prisma-session.repository";
import type {
  SessionRepository,
  StoredSession
} from "../repositories/session.repository";
import { prismaUserRepository } from "../repositories/prisma-user.repository";
import type { StoredUser, UserRepository } from "../repositories/user.repository";
import type { AuthCredentials } from "../schemas/auth.schemas";

export type AuthenticatedUser = {
  id: string;
  email: string;
  createdAt: string;
};

export type AuthenticatedUserResponse = {
  user: AuthenticatedUser;
};

export type AuthSessionResult = {
  sessionId: string;
  sessionExpiresAt: Date;
  user: AuthenticatedUser;
};

type AuthServiceDependencies = {
  userRepository: UserRepository;
  sessionRepository: SessionRepository;
  createSessionId?: () => string;
  createUserId?: () => string;
  now?: () => Date;
  sessionDurationHours?: number;
};

function mapUser(user: StoredUser): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString()
  };
}

function mapUserToResponse(user: StoredUser): AuthenticatedUserResponse {
  return {
    user: mapUser(user)
  };
}

async function createSessionForUser(
  userId: string,
  {
    sessionRepository,
    createSessionId,
    now,
    sessionDurationHours
  }: Required<
    Pick<
      AuthServiceDependencies,
      "sessionRepository" | "createSessionId" | "now" | "sessionDurationHours"
    >
  >
): Promise<StoredSession> {
  const createdAt = now();

  return sessionRepository.create({
    id: createSessionId(),
    userId,
    createdAt,
    expiresAt: new Date(createdAt.getTime() + sessionDurationHours * 60 * 60 * 1000)
  });
}

async function requireActiveSession(
  sessionId: string | null,
  {
    now,
    sessionRepository
  }: Required<Pick<AuthServiceDependencies, "now" | "sessionRepository">>
) {
  const session = await findActiveSession(sessionId, {
    now,
    sessionRepository
  });

  if (!session) {
    throw new AppError(401, "AUTH_REQUIRED", "Authentication is required.");
  }

  return session;
}

async function findActiveSession(
  sessionId: string | null,
  {
    now,
    sessionRepository
  }: Required<Pick<AuthServiceDependencies, "now" | "sessionRepository">>
) {
  if (!sessionId) {
    return null;
  }

  const session = await sessionRepository.findByIdWithUser(sessionId);

  if (!session) {
    return null;
  }

  if (session.expiresAt <= now()) {
    await sessionRepository.deleteById(session.id);

    return null;
  }

  return session;
}

export function buildSignUpService({
  userRepository,
  sessionRepository,
  createSessionId = () => randomBytes(32).toString("base64url"),
  createUserId = randomUUID,
  now = () => new Date(),
  sessionDurationHours = env.SESSION_DURATION_HOURS
}: AuthServiceDependencies) {
  return async function signUp(input: AuthCredentials): Promise<AuthSessionResult> {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError(
        409,
        "EMAIL_CONFLICT",
        "An account with that email already exists."
      );
    }

    const user = await userRepository.create({
      id: createUserId(),
      email: input.email,
      passwordHash: await hashPassword(input.password),
      createdAt: now()
    });
    const session = await createSessionForUser(user.id, {
      sessionRepository,
      createSessionId,
      now,
      sessionDurationHours
    });

    return {
      sessionId: session.id,
      sessionExpiresAt: session.expiresAt,
      user: mapUserToResponse(user).user
    };
  };
}

export function buildLogInService({
  userRepository,
  sessionRepository,
  createSessionId = () => randomBytes(32).toString("base64url"),
  now = () => new Date(),
  sessionDurationHours = env.SESSION_DURATION_HOURS
}: Pick<
  AuthServiceDependencies,
  "userRepository" | "sessionRepository" | "createSessionId" | "now" | "sessionDurationHours"
>) {
  return async function logIn(input: AuthCredentials): Promise<AuthSessionResult> {
    const user = await userRepository.findByEmail(input.email);

    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password."
      );
    }

    const session = await createSessionForUser(user.id, {
      sessionRepository,
      createSessionId,
      now,
      sessionDurationHours
    });

    return {
      sessionId: session.id,
      sessionExpiresAt: session.expiresAt,
      user: mapUserToResponse(user).user
    };
  };
}

export function buildLogOutService({
  sessionRepository
}: Pick<AuthServiceDependencies, "sessionRepository">) {
  return async function logOut(sessionId: string | null) {
    if (!sessionId) {
      return;
    }

    await sessionRepository.deleteById(sessionId);
  };
}

export function buildGetCurrentUserService({
  sessionRepository,
  now = () => new Date()
}: Pick<AuthServiceDependencies, "sessionRepository" | "now">) {
  return async function getCurrentUser(
    sessionId: string | null
  ): Promise<AuthenticatedUserResponse> {
    const session = await requireActiveSession(sessionId, {
      now,
      sessionRepository
    });

    return mapUserToResponse(session.user);
  };
}

export function buildGetOptionalCurrentUserService({
  sessionRepository,
  now = () => new Date()
}: Pick<AuthServiceDependencies, "sessionRepository" | "now">) {
  return async function getOptionalCurrentUser(
    sessionId: string | null
  ): Promise<AuthenticatedUser | null> {
    const session = await findActiveSession(sessionId, {
      now,
      sessionRepository
    });

    return session ? mapUser(session.user) : null;
  };
}

const authServiceDependencies = {
  sessionRepository: prismaSessionRepository,
  userRepository: prismaUserRepository
};

export const signUp = buildSignUpService(authServiceDependencies);
export const logIn = buildLogInService(authServiceDependencies);
export const logOut = buildLogOutService(authServiceDependencies);
export const getCurrentUser = buildGetCurrentUserService(authServiceDependencies);
export const getOptionalCurrentUser = buildGetOptionalCurrentUserService(
  authServiceDependencies
);
