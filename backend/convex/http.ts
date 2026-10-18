import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept",
};

// CORS preflight handler
const handleOptions = httpAction(async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
});

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

// ----------------- ROOT STATUS -----------------
http.route({
  path: "/",
  method: "GET",
  handler: httpAction(async () => {
    return json({ status: "ok", service: "Xon Bozor Convex Backend" });
  }),
});

// ----------------- PRODUCTS -----------------
http.route({
  path: "/api/products",
  method: "OPTIONS",
  handler: handleOptions,
});

http.route({
  path: "/api/products",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const category = url.searchParams.get("category") || undefined;
    const usedParam = url.searchParams.get("used");
    const used = usedParam === "true" ? true : usedParam === "false" ? false : undefined;
    const minPriceParam = url.searchParams.get("minPrice");
    const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
    const maxPriceParam = url.searchParams.get("maxPrice");
    const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;
    const inStock = url.searchParams.get("inStock") === "true";
    const all = url.searchParams.get("all") === "true";

    const products = await ctx.runQuery(api.products.list, {
      search,
      category,
      used,
      minPrice,
      maxPrice,
      inStock,
      all,
    });

    const mapped = products.map((p) => ({
      ...p,
      id: p.originalId || p._id,
      _id: p.originalId || p._id,
      convexId: p._id,
    }));

    return json({
      products: mapped,
      items: mapped,
      total: mapped.length,
      page: 1,
      totalPages: 1,
      pages: 1,
    });
  }),
});

// Categories list: GET /api/products/categories
http.route({
  path: "/api/products/categories",
  method: "OPTIONS",
  handler: handleOptions,
});

http.route({
  path: "/api/products/categories",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const cats = await ctx.runQuery(api.products.categories, {});
    return json(cats);
  }),
});

http.route({
  path: "/api/products",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const contentType = req.headers.get("content-type") || "";
      let body: any = {};

      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        const uploadedImages: string[] = [];

        for (const [key, val] of formData.entries()) {
          if (val instanceof Blob && key === "images") {
            const storageId = await ctx.storage.store(val);
            const fileUrl = await ctx.storage.getUrl(storageId);
            if (fileUrl) uploadedImages.push(fileUrl);
          } else if (typeof val === "string") {
            body[key] = val;
          }
        }

        if (uploadedImages.length > 0) {
          body.images = uploadedImages;
        }
      } else {
        body = await req.json();
      }

      const price = Number(body.price) || 0;
      const oldPrice = body.oldPrice ? Number(body.oldPrice) : undefined;
      const discount = body.discount ? Number(body.discount) : undefined;
      const stock = body.stock !== undefined ? Number(body.stock) : 0;
      const used = body.used === true || body.used === "true";

      let specs = body.specs;
      if (typeof specs === "string") {
        try {
          specs = JSON.parse(specs);
        } catch {}
      }

      let colors = body.colors;
      if (typeof colors === "string") {
        try {
          colors = JSON.parse(colors);
        } catch {
          colors = colors.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
      }

      let storage = body.storage;
      if (typeof storage === "string") {
        try {
          storage = JSON.parse(storage);
        } catch {
          storage = storage.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
      }

      let images = body.images;
      if (typeof images === "string") {
        try {
          images = JSON.parse(images);
        } catch {
          images = [images];
        }
      }

      const product = await ctx.runMutation(api.products.create, {
        name: body.name || "Nomsiz mahsulot",
        description: body.description || "",
        longDescription: body.longDescription || "",
        brand: body.brand || "",
        category: body.category || "Smartfonlar",
        used,
        price,
        oldPrice,
        discount,
        stock,
        isActive: body.isActive !== false && body.isActive !== "false",
        images: Array.isArray(images) ? images : [],
        colors: Array.isArray(colors) ? colors : [],
        storage: Array.isArray(storage) ? storage : [],
        specs: Array.isArray(specs) ? specs : [],
      });

      return json({ success: true, product: { ...product, id: product?._id } }, 201);
    } catch (err: any) {
      return json({ message: err.message }, 400);
    }
  }),
});

// Single product operations: GET, PUT, DELETE /api/products/:id
http.route({
  pathPrefix: "/api/products/",
  method: "OPTIONS",
  handler: handleOptions,
});

http.route({
  pathPrefix: "/api/products/",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const id = url.pathname.replace("/api/products/", "");
    if (!id || id === "categories") {
      const cats = await ctx.runQuery(api.products.categories, {});
      return json(cats);
    }
    try {
      const product = await ctx.runQuery(api.products.getById, { id });
      if (!product) return json({ message: "Mahsulot topilmadi" }, 404);

      const mappedProduct = {
        ...product,
        id: product.originalId || product._id,
        _id: product.originalId || product._id,
        convexId: product._id,
      };

      let related: any[] = [];
      try {
        const relatedDocs = await ctx.runQuery(api.products.getRelated, {
          category: product.category,
          excludeId: String(product._id),
        });
        related = relatedDocs.map((r) => ({
          ...r,
          id: r.originalId || r._id,
          _id: r.originalId || r._id,
        }));
      } catch {}

      return json({
        ...mappedProduct,
        product: mappedProduct,
        related,
      });
    } catch {
      return json({ message: "Mahsulot topilmadi" }, 404);
    }
  }),
});

http.route({
  pathPrefix: "/api/products/",
  method: "PUT",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const id = url.pathname.replace("/api/products/", "") as Id<"products">;
    try {
      const contentType = req.headers.get("content-type") || "";
      let updates: any = {};

      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        const uploadedImages: string[] = [];

        for (const [key, val] of formData.entries()) {
          if (val instanceof Blob && key === "images") {
            const storageId = await ctx.storage.store(val);
            const fileUrl = await ctx.storage.getUrl(storageId);
            if (fileUrl) uploadedImages.push(fileUrl);
          } else if (typeof val === "string") {
            updates[key] = val;
          }
        }
        if (uploadedImages.length > 0) {
          updates.images = uploadedImages;
        }
      } else {
        updates = await req.json();
      }

      if (updates.price !== undefined) updates.price = Number(updates.price);
      if (updates.oldPrice !== undefined) updates.oldPrice = Number(updates.oldPrice);
      if (updates.discount !== undefined) updates.discount = Number(updates.discount);
      if (updates.stock !== undefined) updates.stock = Number(updates.stock);
      if (updates.used !== undefined) updates.used = updates.used === true || updates.used === "true";

      const updated = await ctx.runMutation(api.products.update, {
        id,
        updates,
      });

      return json({ success: true, product: { ...updated, id: updated?._id } });
    } catch (err: any) {
      return json({ message: err.message }, 400);
    }
  }),
});

http.route({
  pathPrefix: "/api/products/",
  method: "DELETE",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const id = url.pathname.replace("/api/products/", "") as Id<"products">;
    try {
      await ctx.runMutation(api.products.remove, { id });
      return json({ success: true, message: "Mahsulot o'chirildi" });
    } catch (err: any) {
      return json({ message: err.message }, 400);
    }
  }),
});

// ----------------- ORDERS -----------------
http.route({
  path: "/api/orders",
  method: "OPTIONS",
  handler: handleOptions,
});

http.route({
  path: "/api/orders",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;
    const orders = await ctx.runQuery(api.orders.list, { status });

    const mapped = orders.map((o) => ({
      ...o,
      id: o.originalId || o._id,
      _id: o.originalId || o._id,
      convexId: o._id,
    }));

    return json({
      orders: mapped,
      items: mapped,
      total: mapped.length,
      pages: 1,
      page: 1,
    });
  }),
});

http.route({
  path: "/api/orders",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const contentType = req.headers.get("content-type") || "";
      let body: any = {};
      let receiptUrl: string | undefined;

      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        for (const [key, val] of formData.entries()) {
          if (val instanceof Blob && key === "receipt") {
            const storageId = await ctx.storage.store(val);
            receiptUrl = (await ctx.storage.getUrl(storageId)) || undefined;
          } else if (typeof val === "string") {
            body[key] = val;
          }
        }
      } else {
        body = await req.json();
      }

      let items = body.items;
      if (typeof items === "string") {
        try {
          items = JSON.parse(items);
        } catch {}
      }

      let address = body.address;
      if (typeof address === "string") {
        try {
          address = JSON.parse(address);
        } catch {}
      }

      let customer = body.customerInfo || body.customer;
      if (typeof customer === "string") {
        try {
          customer = JSON.parse(customer);
        } catch {}
      }

      const total = Number(body.total) || 0;

      const order = await ctx.runMutation(api.orders.create, {
        customer: customer || {},
        items: Array.isArray(items) ? items : [],
        address: address || {},
        total,
        paymentMethod: body.paymentMethod || "card",
        receipt: receiptUrl || body.receipt,
        subtotal: Number(body.subtotal) || total,
        discount: Number(body.discount) || 0,
      });

      // Telegram notification
      if (order) {
        const itemsList = (Array.isArray(items) ? items : [])
          .map((i: any) => `• ${i.name || "Mahsulot"} x ${i.qty || 1} ($${i.price || 0})`)
          .join("\n");

        ctx.runAction(api.telegram.notifyNewOrder, {
          orderNumber: order.orderNumber,
          customerName: order.customer?.name || "Mijoz",
          phone: order.customer?.phone || order.address?.phone || "",
          total: order.total,
          itemsCount: order.items?.length || 1,
          address: order.address?.text || order.address?.title,
          itemsSummary: itemsList || "Savat",
        });
      }

      return json({ success: true, order: { ...order, id: order?._id } }, 201);
    } catch (err: any) {
      return json({ message: err.message }, 400);
    }
  }),
});

http.route({
  path: "/api/orders/payment-info",
  method: "OPTIONS",
  handler: handleOptions,
});

http.route({
  path: "/api/orders/payment-info",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const info = await ctx.runQuery(api.auth.getPaymentInfo, {});
    return json(info);
  }),
});

// Order status update: PUT /api/orders/:id/status
http.route({
  pathPrefix: "/api/orders/",
  method: "OPTIONS",
  handler: handleOptions,
});

http.route({
  pathPrefix: "/api/orders/",
  method: "PUT",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    // e.g. /api/orders/xyz/status
    const parts = url.pathname.replace("/api/orders/", "").split("/");
    const id = parts[0] as Id<"orders">;
    const action = parts[1];

    if (action === "status") {
      const { status } = await req.json();
      const order = await ctx.runMutation(api.orders.updateStatus, { id, status });
      return json({ success: true, order: { ...order, id: order?._id } });
    }

    return json({ message: "Not found" }, 404);
  }),
});

http.route({
  pathPrefix: "/api/orders/",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const parts = url.pathname.replace("/api/orders/", "").split("/");
    const id = parts[0] as Id<"orders">;
    const action = parts[1];

    if (action === "receipt") {
      const order = await ctx.runQuery(api.orders.getById, { id });
      if (order?.receipt) {
        return Response.redirect(order.receipt, 302);
      }
      return json({ message: "Chek topilmadi" }, 404);
    }

    const order = await ctx.runQuery(api.orders.getById, { id });
    if (!order) return json({ message: "Buyurtma topilmadi" }, 404);
    return json({ ...order, id: order._id });
  }),
});

// ----------------- SITE CONTENT -----------------
http.route({
  path: "/api/site-content",
  method: "OPTIONS",
  handler: handleOptions,
});

http.route({
  path: "/api/site-content",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const content = await ctx.runQuery(api.siteContent.get, {});
    return json({
      ...content,
      content,
    });
  }),
});

http.route({
  path: "/api/site-content",
  method: "PUT",
  handler: httpAction(async (ctx, req) => {
    try {
      const data = await req.json();
      const updated = await ctx.runMutation(api.siteContent.update, {
        content: data.content || data,
      });
      return json({ success: true, ...updated, content: updated });
    } catch (err: any) {
      return json({ message: err.message }, 400);
    }
  }),
});

// ----------------- USERS -----------------
http.route({
  path: "/api/users",
  method: "OPTIONS",
  handler: handleOptions,
});

http.route({
  path: "/api/users",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const users = await ctx.runQuery(api.users.list, {});
    return json({
      users,
      items: users,
      total: users.length,
      pages: 1,
    });
  }),
});

// User login: POST /api/users/login
http.route({
  path: "/api/users/login",
  method: "OPTIONS",
  handler: handleOptions,
});

http.route({
  path: "/api/users/login",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const body = await req.json();
      const loginStr = (body.login || body.email || body.phone || "").trim();
      const res = await ctx.runMutation(api.users.login, {
        login: loginStr,
        password: body.password || "",
      });
      return json(res);
    } catch (err: any) {
      return json({ message: err.message || "Kirishda xatolik" }, 400);
    }
  }),
});

// User register: POST /api/users/register
http.route({
  path: "/api/users/register",
  method: "OPTIONS",
  handler: handleOptions,
});

http.route({
  path: "/api/users/register",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const contentType = req.headers.get("content-type") || "";
      let name = "";
      let email = "";
      let phone = "";
      let password = "";
      let avatarUrl = "";

      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        name = (formData.get("name") as string) || "";
        email = (formData.get("email") as string) || "";
        phone = (formData.get("phone") as string) || "";
        password = (formData.get("password") as string) || "";
        const avatarBlob = formData.get("avatar");
        if (avatarBlob instanceof Blob) {
          const storageId = await ctx.storage.store(avatarBlob);
          avatarUrl = (await ctx.storage.getUrl(storageId)) || "";
        }
      } else {
        const body = await req.json();
        name = body.name || "";
        email = body.email || "";
        phone = body.phone || "";
        password = body.password || "";
        avatarUrl = body.avatar || "";
      }

      const res = await ctx.runMutation(api.users.register, {
        name,
        email: email || undefined,
        phone: phone || undefined,
        password,
        avatar: avatarUrl || undefined,
      });

      return json(res, 201);
    } catch (err: any) {
      return json({ message: err.message || "Ro'yxatdan o'tishda xatolik" }, 400);
    }
  }),
});

// User me: GET /api/users/me & PUT /api/users/me
http.route({
  path: "/api/users/me",
  method: "OPTIONS",
  handler: handleOptions,
});

http.route({
  path: "/api/users/me",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ message: "Avtorizatsiya talab qilinadi" }, 401);

    const user = await ctx.runQuery(api.users.getMe, { token });
    if (!user) return json({ message: "Foydalanuvchi topilmadi" }, 404);
    return json({ user, ...user });
  }),
});

http.route({
  path: "/api/users/me",
  method: "PUT",
  handler: httpAction(async (ctx, req) => {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ message: "Avtorizatsiya talab qilinadi" }, 401);

    const user = await ctx.runQuery(api.users.getMe, { token });
    if (!user) return json({ message: "Foydalanuvchi topilmadi" }, 404);

    try {
      const contentType = req.headers.get("content-type") || "";
      let name = user.name;
      let email = user.email;
      let phone = user.phone;
      let avatar = user.avatar;

      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        if (formData.has("name")) name = formData.get("name") as string;
        if (formData.has("email")) email = formData.get("email") as string;
        if (formData.has("phone")) phone = formData.get("phone") as string;

        for (const [key, val] of formData.entries()) {
          if (val instanceof Blob && (key === "avatar" || key === "file" || key === "image")) {
            const storageId = await ctx.storage.store(val);
            const url = await ctx.storage.getUrl(storageId);
            if (url) avatar = url;
          }
        }
      } else {
        const body = await req.json();
        if (body.name) name = body.name;
        if (body.email) email = body.email;
        if (body.phone) phone = body.phone;
        if (body.avatar) avatar = body.avatar;
      }

      const updated = await ctx.runMutation(api.users.updateProfile, {
        userId: String(user.convexId || user._id),
        name,
        email,
        phone,
        avatar,
      });

      return json({ success: true, user: updated, ...updated });
    } catch (err: any) {
      return json({ message: err.message }, 400);
    }
  }),
});

// User password: PUT /api/users/password
http.route({
  path: "/api/users/password",
  method: "OPTIONS",
  handler: handleOptions,
});

http.route({
  path: "/api/users/password",
  method: "PUT",
  handler: httpAction(async (ctx, req) => {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ message: "Avtorizatsiya talab qilinadi" }, 401);

    const user = await ctx.runQuery(api.users.getMe, { token });
    if (!user) return json({ message: "Foydalanuvchi topilmadi" }, 404);

    try {
      const body = await req.json();
      await ctx.runMutation(api.users.changePassword, {
        userId: String(user.convexId || user._id),
        newPassword: body.newPassword || body.password,
      });
      return json({ success: true, message: "Parol yangilandi" });
    } catch (err: any) {
      return json({ message: err.message }, 400);
    }
  }),
});

// ----------------- AUTH -----------------
http.route({
  path: "/api/auth/login",
  method: "OPTIONS",
  handler: handleOptions,
});

http.route({
  path: "/api/auth/login",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const { username, password } = await req.json();
      const result = await ctx.runMutation(api.auth.login, {
        username: username || "admin",
        password: password || "adminxon77",
      });
      return json(result);
    } catch (err: any) {
      return json({ message: err.message }, 401);
    }
  }),
});

// ----------------- FILE UPLOAD HELPER -----------------
http.route({
  path: "/api/upload",
  method: "OPTIONS",
  handler: handleOptions,
});

http.route({
  path: "/api/upload",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const blob = await req.blob();
      const storageId = await ctx.storage.store(blob);
      const url = await ctx.storage.getUrl(storageId);
      return json({ url, storageId });
    } catch (err: any) {
      return json({ message: err.message }, 500);
    }
  }),
});

// ----------------- SERVE UPLOADS -----------------
http.route({
  pathPrefix: "/uploads/",
  method: "OPTIONS",
  handler: handleOptions,
});

http.route({
  pathPrefix: "/uploads/",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const filename = decodeURIComponent(url.pathname.replace(/^\/uploads\/?/, ""));
    console.log("Uploads request filename:", filename);

    // 1. Try finding in images table
    try {
      const imgDoc = await ctx.runQuery(api.images.getByFilename, { filename });
      if (imgDoc) {
        if (imgDoc.storageId) {
          const fileUrl = await ctx.storage.getUrl(imgDoc.storageId as any);
          if (fileUrl) return Response.redirect(fileUrl, 302);
        }
        if (imgDoc.data) {
          const binaryString = atob(imgDoc.data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return new Response(bytes, {
            headers: {
              "Content-Type": imgDoc.mime || "image/jpeg",
              "Cache-Control": "public, max-age=31536000, immutable",
              ...corsHeaders,
            },
          });
        }
      }
    } catch {}

    // 2. Direct storageId lookup
    try {
      const directUrl = await ctx.storage.getUrl(filename as any);
      if (directUrl) return Response.redirect(directUrl, 302);
    } catch {}

    return new Response("Image not found", { status: 404, headers: corsHeaders });
  }),
});

export default http;
