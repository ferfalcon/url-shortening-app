import type {
  CreateStoredLinkInput,
  LinkRepository,
  StoredLink
} from "./link.repository";

class InMemoryLinkRepository implements LinkRepository {
  private readonly links: StoredLink[] = [];

  async create(input: CreateStoredLinkInput): Promise<StoredLink> {
    this.links.push(input);

    return input;
  }

  async findByCustomAlias(customAlias: string): Promise<StoredLink | null> {
    return this.links.find((link) => link.customAlias === customAlias) ?? null;
  }
}

export const inMemoryLinkRepository = new InMemoryLinkRepository();
