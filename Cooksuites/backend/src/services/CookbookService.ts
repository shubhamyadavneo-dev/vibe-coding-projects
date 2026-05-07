import { Cookbook } from '@prisma/client';
import prisma from '../lib/prisma';
import { mediaStorageService } from './MediaStorageService';

export interface CookbookCreateInput {
  name: string;
  description?: string;
  image?: Express.Multer.File;
}

export interface CookbookUpdateInput {
  name?: string;
  description?: string;
  image?: Express.Multer.File;
}

export class CookbookService {
  private isMissingImageColumnError(error: unknown): boolean {
    const anyError = error as any;
    const message = anyError?.message || '';
    return (
      anyError?.code === 'P2022' ||
      message.includes('Unknown argument `image`') ||
      message.includes('column "image" does not exist') ||
      message.includes('The column `image` does not exist')
    );
  }

  async createCookbook(data: CookbookCreateInput, userId: string): Promise<Cookbook> {
    const { image, ...cookbookData } = data;
    let created: Cookbook;
    try {
      created = await prisma.cookbook.create({
        data: {
          ...cookbookData,
          userId
        }
      });
    } catch (error) {
      if (this.isMissingImageColumnError(error)) {
        // Fallback for environments where Prisma schema is newer than DB schema.
        const rows = await prisma.$queryRaw<Array<{
          id: string;
          name: string;
          description: string | null;
          user_id: string;
          created_at: Date;
          updated_at: Date;
          deleted_at: Date | null;
        }>>`
          INSERT INTO cookbooks (name, description, user_id, created_at, updated_at)
          VALUES (${cookbookData.name}, ${cookbookData.description ?? null}, ${userId}, NOW(), NOW())
          RETURNING id, name, description, user_id, created_at, updated_at, deleted_at
        `;

        const row = rows[0];
        if (!row) {
          throw error;
        }

        created = {
          id: row.id,
          name: row.name,
          description: row.description,
          userId: row.user_id,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          deletedAt: row.deleted_at,
          image: null,
        } as unknown as Cookbook;
      } else {
        throw error;
      }
    }

    if (image) {
      try {
        const imageUrl = await mediaStorageService.upload(image, `cookbooks/${created.id}`);
        try {
          return (prisma as any).cookbook.update({
            where: { id: created.id },
            data: { image: imageUrl }
          });
        } catch (error: any) {
          if (this.isMissingImageColumnError(error)) {
            return created;
          }
          throw error;
        }
      } catch (error) {
        console.error('Cookbook image upload failed on create:', error);
        return created;
      }
    }

    return created;
  }

  async getCookbook(id: string): Promise<Cookbook | null> {
    return prisma.cookbook.findFirst({
      where: { id, deletedAt: null },
      include: {
        recipes: {
          include: {
            recipe: {
              include: {
                images: true,
                ingredients: true
              }
            }
          }
        }
      }
    });
  }

  async listUserCookbooks(userId: string): Promise<Cookbook[]> {
    return prisma.cookbook.findMany({
      where: { userId, deletedAt: null },
      include: {
        _count: {
          select: { recipes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addRecipeToCookbook(cookbookId: string, recipeId: string): Promise<void> {
    await prisma.cookbookRecipe.upsert({
      where: {
        cookbookId_recipeId: { cookbookId, recipeId }
      },
      create: { cookbookId, recipeId },
      update: {} // Do nothing if already exists
    });
  }

  async removeRecipeFromCookbook(cookbookId: string, recipeId: string): Promise<void> {
    await prisma.cookbookRecipe.delete({
      where: {
        cookbookId_recipeId: { cookbookId, recipeId }
      }
    });
  }

  async updateCookbook(id: string, data: CookbookUpdateInput, userId: string): Promise<Cookbook> {
    const { image, ...cookbookData } = data;
    let imageUrl: string | undefined;
    if (image) {
      try {
        imageUrl = await mediaStorageService.upload(image, `cookbooks/${id}`);
      } catch (error) {
        console.error('Cookbook image upload failed on update:', error);
      }
    }

    try {
      return (prisma as any).cookbook.update({
        where: { id, userId },
        data: {
          ...cookbookData,
          ...(imageUrl ? { image: imageUrl } : {})
        }
      });
    } catch (error: any) {
      if (
        imageUrl &&
        this.isMissingImageColumnError(error)
      ) {
        return prisma.cookbook.update({
          where: { id, userId },
          data: cookbookData
        });
      }
      throw error;
    }
  }

  async deleteCookbook(id: string, userId: string): Promise<void> {
    await prisma.cookbook.update({
      where: { id, userId },
      data: { deletedAt: new Date() }
    });
  }
}

export const cookbookService = new CookbookService();
