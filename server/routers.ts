import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ===== CUSTOMERS =====
  customers: router({
    list: protectedProcedure.query(({ ctx }) => db.getCustomers(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        cpf: z.string().regex(/^\d{11}$/),
      }))
      .mutation(({ ctx, input }) => db.createCustomer({
        userId: ctx.user.id,
        ...input,
      })),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().min(1).optional(),
        cpf: z.string().regex(/^\d{11}$/).optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateCustomer(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteCustomer(input.id)),
  }),

  // ===== PRODUCTS =====
  products: router({
    list: protectedProcedure.query(({ ctx }) => db.getProducts(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.number().int().min(0),
        imageUrl: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createProduct({
        userId: ctx.user.id,
        ...input,
      })),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.number().int().min(0).optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateProduct(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteProduct(input.id)),
  }),

  // ===== SALES =====
  sales: router({
    list: protectedProcedure.query(({ ctx }) => db.getSales(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        totalAmount: z.number().int().min(0),
        paymentMethod: z.enum(["pix", "cartao", "dinheiro"]),
        installments: z.number().int().min(1).default(1),
        amountReceived: z.number().int().optional(),
        change: z.number().int().optional(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number().int().min(1),
          unitPrice: z.number().int().min(0),
          totalPrice: z.number().int().min(0),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const { items, ...saleData } = input;
        const sale = await db.createSale({
          userId: ctx.user.id,
          ...saleData,
        });
        const saleId = (sale as any).insertId;
        await db.createSaleItems(items.map(item => ({
          saleId,
          ...item,
        })));
        return { saleId, ...saleData };
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const sale = await db.getSaleById(input.id);
        if (!sale) return null;
        const items = await db.getSaleItems(input.id);
        return { ...sale, items };
      }),
  })
});

export type AppRouter = typeof appRouter;
