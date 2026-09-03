/**
 * Seeds dummy Quotations, Sales Orders, Invoices, Payments, Storefront
 * (StoreOrder) orders and Stock Movements for local testing - e.g. trying
 * out the Reports/Dashboard pages against something other than an empty
 * database.
 *
 * IMPORTANT: this is a TEST DATA script. It deletes existing Quotation /
 * Order / Invoice / Payment / StoreOrder / Movement / Customer documents
 * before reseeding (see CLEAR_COLLECTIONS below) so it's safe to re-run
 * repeatedly. It never touches Product or Category - run
 * `scripts/seed-catalog.ts` first if those are empty.
 *
 * DO NOT run this against a production database. It's guarded behind an
 * explicit --force flag for exactly that reason.
 *
 * Usage:
 *   npx tsx scripts/seed-sales-data.ts --force
 *   npx tsx scripts/seed-sales-data.ts --force --customers=40 --store-orders=100
 */

import "dotenv/config";

import mongoose from "mongoose";

import { CustomerModel } from "../lib/models/Customer";

import {
  ProductModel,
  type IProduct,
  type IProductVariant,
} from "../lib/models/Product";

import {
  QuotationModel,
  type IQuotationLineItem,
  type QuotationFulfillmentPlan,
} from "../lib/models/Quotation";

import {
  OrderModel,
  type IOrderLineItem,
} from "../lib/models/Order";

import {
  InvoiceModel,
  type IInvoiceLineItem,
} from "../lib/models/Invoice";

import { PaymentModel } from "../lib/models/Payment";

import {
  StoreOrderModel,
  type IStoreOrderItem,
} from "../lib/models/StoreOrder";

import { MovementModel } from "../lib/models/Movement";

import { calculateInvoiceTotals } from "../modules/invoicing/calculations";

// ---------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not defined. Add it to your .env file.",
  );
}

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg
      .replace(/^--/, "")
      .split("=");

    return [key, value ?? "true"];
  }),
);

function argNumber(
  key: string,
  fallback: number,
): number {
  const raw = args.get(key);
  const parsed = raw
    ? Number.parseInt(raw, 10)
    : NaN;

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

const FORCE = args.has("force");

const CUSTOMER_COUNT = argNumber(
  "customers",
  25,
);

const QUOTATION_COUNT = argNumber(
  "quotations",
  40,
);

const STANDALONE_ORDER_COUNT = argNumber(
  "orders",
  15,
);

const STANDALONE_INVOICE_COUNT = argNumber(
  "invoices",
  10,
);

const STORE_ORDER_COUNT = argNumber(
  "store-orders",
  60,
);

/**
 * Historical reporting period.
 *
 * January 1, 2026 -> September 3, 2026.
 */
const START_DATE = new Date(
  "2026-01-01T00:00:00.000Z",
);

const END_DATE = new Date(
  "2026-09-03T23:59:59.999Z",
);

// These are wiped and reseeded on every run.
// Product/Category are intentionally excluded.
const CLEAR_COLLECTIONS = true;

// ---------------------------------------------------------------------
// Small helpers (same as before)
// ---------------------------------------------------------------------

function randomInt(
  min: number,
  max: number,
): number {
  return (
    Math.floor(
      Math.random() * (max - min + 1),
    ) + min
  );
}

function randomPick<T>(
  arr: T[],
): T {
  return arr[
    Math.floor(
      Math.random() * arr.length,
    )
  ];
}

function randomSubset<T>(
  arr: T[],
  min: number,
  max: number,
): T[] {
  const count = Math.min(
    arr.length,
    randomInt(min, max),
  );

  const shuffled = [...arr].sort(
    () => Math.random() - 0.5,
  );

  return shuffled.slice(0, count);
}

function weightedPick<T>(
  pairs: [T, number][],
): T {
  const total = pairs.reduce(
    (sum, [, weight]) =>
      sum + weight,
    0,
  );

  let roll =
    Math.random() * total;

  for (const [value, weight] of pairs) {
    roll -= weight;

    if (roll <= 0) {
      return value;
    }
  }

  return pairs[
    pairs.length - 1
  ][0];
}

function addDays(
  date: Date,
  days: number,
): Date {
  return new Date(
    date.getTime() +
      days *
        24 *
        60 *
        60 *
        1000,
  );
}

function randomDateBetween(
  start: Date,
  end: Date,
): Date {
  const startTime =
    start.getTime();

  const endTime =
    end.getTime();

  return new Date(
    startTime +
      Math.random() *
        (endTime - startTime),
  );
}

function randomDateWithinPeriod(): Date {
  return randomDateBetween(
    START_DATE,
    END_DATE,
  );
}

const MONTH_WEIGHTS: [
  number,
  number,
][] = [
  [0, 5],
  [1, 7],
  [2, 9],
  [3, 6],
  [4, 10],
  [5, 13],
  [6, 16],
  [7, 20],
  [8, 8],
];

function randomBusinessDate(): Date {
  const month = weightedPick(
    MONTH_WEIGHTS,
  );

  const monthStart = new Date(
    Date.UTC(
      2026,
      month,
      1,
      8,
      0,
      0,
      0,
    ),
  );

  const nextMonth =
    month === 11
      ? new Date(
          Date.UTC(
            2027,
            0,
            1,
          ),
        )
      : new Date(
          Date.UTC(
            2026,
            month + 1,
            1,
          ),
        );

  const monthEnd = new Date(
    nextMonth.getTime() - 1,
  );

  const endDate =
    monthEnd.getTime() >
    END_DATE.getTime()
      ? END_DATE
      : monthEnd;

  return randomDateBetween(
    monthStart,
    endDate,
  );
}

function randomDateAfter(
  date: Date,
  minDays: number,
  maxDays: number,
): Date {
  const earliest = addDays(
    date,
    minDays,
  );

  const latest = addDays(
    date,
    maxDays,
  );

  if (
    earliest.getTime() >=
    END_DATE.getTime()
  ) {
    return new Date(END_DATE);
  }

  const end =
    latest.getTime() >
    END_DATE.getTime()
      ? END_DATE
      : latest;

  return randomDateBetween(
    earliest,
    end,
  );
}

function pad(
  value: number,
  size = 4,
): string {
  return value
    .toString()
    .padStart(size, "0");
}

function makeNumberGenerator(
  prefix: string,
  startingSeq = 0,
) {
  let seq = startingSeq;

  return () => {
    seq += 1;

    const year = 2026;

    return `${prefix}-${year}-${pad(seq)}`;
  };
}

async function backdate(
  doc: {
    createdAt?: Date;
    updatedAt?: Date;

    save: (
      opts?: {
        timestamps?: boolean;
      },
    ) => Promise<unknown>;
  },
  date: Date,
) {
  doc.createdAt = date;
  doc.updatedAt = date;

  await doc.save({
    timestamps: false,
  });
}

// ---------------------------------------------------------------------
// Dummy data pools (same as before)
// ---------------------------------------------------------------------

const FIRST_NAMES = [
  "James",
  "Mary",
  "John",
  "Grace",
  "Peter",
  "Faith",
  "David",
  "Ann",
  "Samuel",
  "Joyce",
  "Daniel",
  "Esther",
  "Joseph",
  "Lucy",
  "Michael",
  "Winnie",
  "Kevin",
  "Purity",
  "Brian",
  "Naomi",
  "Dennis",
  "Caroline",
  "Patrick",
  "Mercy",
  "George",
  "Diana",
  "Anthony",
  "Sharon",
  "Paul",
  "Ruth",
];

const LAST_NAMES = [
  "Mwangi",
  "Otieno",
  "Wanjiru",
  "Kariuki",
  "Achieng",
  "Njoroge",
  "Kimani",
  "Wafula",
  "Odhiambo",
  "Chebet",
  "Mutua",
  "Njeri",
  "Kamau",
  "Auma",
  "Cheruiyot",
  "Wekesa",
  "Muthoni",
  "Omondi",
  "Kiptoo",
  "Nyambura",
];

const COMPANY_TYPES = [
  "Construction",
  "Logistics",
  "Engineering",
  "Manufacturing",
  "Mining",
  "Agro",
  "Builders",
  "Contractors",
  "Industries",
  "Energy",
  "Fabricators",
  "Haulage",
];

const COMPANY_PREFIXES = [
  "Rift Valley",
  "Coastline",
  "Nairobi",
  "Highland",
  "Savannah",
  "Equator",
  "Mombasa",
  "Lakeview",
  "Summit",
  "Horizon",
  "Baraka",
  "Zawadi",
  "Amani",
  "Prime",
  "Apex",
  "Metro",
];

const CITIES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Naivasha",
  "Machakos",
  "Kiambu",
  "Nyeri",
  "Kitale",
  "Kakamega",
];

const STREETS = [
  "Mombasa Road",
  "Enterprise Road",
  "Lunga Lunga Road",
  "Kimathi Street",
  "Moi Avenue",
  "Waiyaki Way",
  "Ngong Road",
  "Outer Ring Road",
  "Industrial Area",
  "Kenyatta Avenue",
  "Uhuru Highway",
  "Airport North Road",
];

const NOTES_POOL = [
  "Customer requested delivery before end of month.",
  "Bulk order for site restocking.",
  "Repeat customer - priority handling.",
  "Please confirm sizes before dispatch.",
  "Delivery to site office, not warehouse.",
  "",
  "",
  "",
];

const TERMS_POOL = [
  "Payment due within 30 days of invoice date. Goods remain property of SafetyHub until paid in full.",
  "50% deposit required, balance on delivery.",
  "Net 14 days. Late payments subject to a 2% monthly surcharge.",
];

function randomPersonName(): string {
  return `${randomPick(
    FIRST_NAMES,
  )} ${randomPick(
    LAST_NAMES,
  )}`;
}

function randomCompanyName(): string {
  return `${randomPick(
    COMPANY_PREFIXES,
  )} ${randomPick(
    COMPANY_TYPES,
  )} ${randomPick([
    "Ltd",
    "Ltd",
    "Co.",
    "Group",
    "Suppliers",
  ])}`;
}

function randomPhone(): string {
  return `+2547${randomInt(
    10000000,
    99999999,
  )}`;
}

function slugifyForEmail(
  value: string,
): string {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      ".",
    )
    .replace(
      /^\.+|\.+$/g,
      "",
    );
}

function randomEmail(
  name: string,
): string {
  const domains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "business.co.ke",
  ];

  return `${slugifyForEmail(
    name,
  )}${randomInt(
    1,
    999,
  )}@${randomPick(domains)}`;
}

function randomAddress(): {
  address: string;
  city: string;
  country: string;
} {
  const city = randomPick(CITIES);

  return {
    address: `${randomInt(
      1,
      400,
    )} ${randomPick(STREETS)}`,
    city,
    country: "Kenya",
  };
}

// ---------------------------------------------------------------------
// Line item generation
// ---------------------------------------------------------------------

interface FlatProduct {
  id: string;
  name: string;
  sku?: string;
  price: number;
  variants: IProductVariant[];
}

function pickPriceAndVariant(
  product: FlatProduct,
): {
  unitPrice: number;
  variantSku?: string;
  size?: string;
} {
  if (
    product.variants.length > 0
  ) {
    const variant = randomPick(
      product.variants,
    );

    return {
      unitPrice: variant.price,
      variantSku: variant.sku,
      size: variant.size,
    };
  }

  return {
    unitPrice: product.price,
  };
}

function generateLineItems(
  products: FlatProduct[],
  count: number,
): {
  productId?: string;
  name: string;
  variantSku?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
}[] {
  const chosen = randomSubset(
    products,
    1,
    count,
  );

  return chosen.map(
    (product) => {
      const {
        unitPrice,
        variantSku,
        size,
      } =
        pickPriceAndVariant(
          product,
        );

      return {
        productId: product.id,
        name: product.name,
        variantSku,
        size,
        quantity: randomInt(
          1,
          12,
        ),
        unitPrice,
        taxRate:
          weightedPick<number>([
            [16, 8],
            [0, 1],
          ]),
        discount:
          weightedPick<number>([
            [0, 6],
            [5, 2],
            [10, 2],
          ]),
      };
    },
  );
}

// ---------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------

async function seed() {
  if (!FORCE) {
    console.error(
      "\nRefusing to run without --force.\n" +
        "This script deletes existing Quotations/Orders/Invoices/Payments/StoreOrders/Customers/Movements before reseeding.\n" +
        "Double-check MONGODB_URI in your .env points at a DEV/TEST database, then re-run with --force.\n",
    );

    process.exit(1);
  }

  await mongoose.connect(
    MONGODB_URI,
  );

  console.log(
    "Connected to MongoDB.",
  );

  console.log(
    `Seeding dates from ${START_DATE.toISOString()} to ${END_DATE.toISOString()}`,
  );

  try {
    const rawProducts =
      await ProductModel.find(
        {},
      ).lean<IProduct[]>();

    if (
      rawProducts.length === 0
    ) {
      console.error(
        "No products found. Run `npx tsx scripts/seed-catalog.ts` first, then re-run this script.",
      );

      process.exit(1);
    }

    const products: FlatProduct[] =
      rawProducts.map((p) => ({
        id: String(p._id),
        name: p.name,
        sku: p.sku,
        price: p.price,
        variants: p.variants ?? [],
      }));

    if (CLEAR_COLLECTIONS) {
      await Promise.all([
        QuotationModel.deleteMany(
          {},
        ),

        OrderModel.deleteMany(
          {},
        ),

        InvoiceModel.deleteMany(
          {},
        ),

        PaymentModel.deleteMany(
          {},
        ),

        StoreOrderModel.deleteMany(
          {},
        ),

        MovementModel.deleteMany(
          {},
        ),

        CustomerModel.deleteMany(
          {},
        ),
      ]);

      console.log(
        "Cleared existing Quotations, Orders, Invoices, Payments, StoreOrders, Movements, Customers.",
      );
    }

    // -----------------------------------------------------------------
    // Customers
    // -----------------------------------------------------------------

    const customers = [];

    for (
      let i = 0;
      i < CUSTOMER_COUNT;
      i++
    ) {
      const isCompany =
        Math.random() > 0.4;

      const name = isCompany
        ? randomCompanyName()
        : randomPersonName();

      const {
        address: streetAddress,
        city,
      } = randomAddress();

      const customer =
        await CustomerModel.create({
          name,

          email:
            randomEmail(name),

          phone:
            randomPhone(),

          company: isCompany
            ? name
            : undefined,

          address: `${streetAddress}, ${city}`,
        });

      await backdate(
        customer,
        randomBusinessDate(),
      );

      customers.push(customer);
    }

    console.log(
      `Created ${customers.length} customers.`,
    );

    // -----------------------------------------------------------------
    // Quotations
    // -----------------------------------------------------------------

    const nextQuoNumber =
      makeNumberGenerator(
        "QUO",
      );

    const quotationDocs: {
      doc: InstanceType<
        typeof QuotationModel
      >;

      issueDate: Date;
    }[] = [];

    for (
      let i = 0;
      i < QUOTATION_COUNT;
      i++
    ) {
      const customer =
        randomPick(customers);

      const issueDate =
        randomDateBetween(
          customer.createdAt ??
            START_DATE,
          END_DATE,
        );

      const validUntil =
        addDays(
          issueDate,
          randomInt(7, 30),
        );

      const status =
        weightedPick<
          | "draft"
          | "sent"
          | "accepted"
          | "rejected"
          | "expired"
        >([
          ["accepted", 5],
          ["sent", 3],
          ["draft", 2],
          ["rejected", 2],
          ["expired", 2],
        ]);

      const rawItems =
        generateLineItems(
          products,
          randomInt(1, 5),
        );

      const items: IQuotationLineItem[] =
        rawItems.map(
          (item) => {
            const stockRef =
              products.find(
                (p) =>
                  p.id ===
                  item.productId,
              );

            const available =
              stockRef
                ? randomInt(0, 60)
                : undefined;

            const fulfillmentPlan:
              | QuotationFulfillmentPlan
              | undefined =
              available ===
              undefined
                ? undefined
                : available >=
                    item.quantity
                  ? "available"
                  : available > 0
                    ? "partial"
                    : "procurement";

            return {
              ...item,
              availableAtQuote:
                available,
              fulfillmentPlan,
            };
          },
        );

      const quotation =
        await QuotationModel.create(
          {
            number:
              nextQuoNumber(),

            customer:
              customer._id,

            items,

            status,

            issueDate,

            validUntil,

            notes:
              randomPick(
                NOTES_POOL,
              ),

            terms:
              randomPick(
                TERMS_POOL,
              ),
          },
        );

      await backdate(
        quotation,
        issueDate,
      );

      quotationDocs.push({
        doc: quotation,
        issueDate,
      });
    }

    console.log(
      `Created ${quotationDocs.length} quotations.`,
    );

    // -----------------------------------------------------------------
    // Orders
    // -----------------------------------------------------------------

    const nextOrderNumber =
      makeNumberGenerator(
        "ORD",
      );

    const orderDocs: {
      doc: InstanceType<
        typeof OrderModel
      >;

      createdAt: Date;
    }[] = [];

    const acceptedQuotations =
      quotationDocs.filter(
        (q) =>
          q.doc.status ===
          "accepted",
      );

    for (const {
      doc: quotation,
      issueDate,
    } of acceptedQuotations) {
      const createdAt =
        randomDateAfter(
          issueDate,
          0,
          3,
        );

      const status =
        weightedPick<
          | "pending"
          | "confirmed"
          | "processing"
          | "shipped"
          | "delivered"
          | "cancelled"
        >([
          ["delivered", 4],
          ["shipped", 2],
          ["processing", 2],
          ["confirmed", 2],
          ["pending", 1],
          ["cancelled", 1],
        ]);

      const items: IOrderLineItem[] =
        quotation.items.map(
          (item) => ({
            productId:
              item.productId,

            name: item.name,

            description:
              item.description,

            variantSku:
              item.variantSku,

            size:
              item.size,

            quantity:
              item.quantity,

            unitPrice:
              item.unitPrice,

            taxRate:
              item.taxRate,

            discount:
              item.discount,
          }),
        );

      const order =
        await OrderModel.create({
          number:
            nextOrderNumber(),

          customer:
            quotation.customer,

          items,

          status,

          notes:
            randomPick(
              NOTES_POOL,
            ),

          quotationId:
            quotation._id,

          stockDecremented:
            status === "shipped" ||
            status === "delivered",

          reservedStock: true,

          fulfillmentStatus:
            weightedPick<
              | "AVAILABLE"
              | "PARTIALLY_AVAILABLE"
              | "BACKORDERED"
            >([
              [
                "AVAILABLE",
                6,
              ],
              [
                "PARTIALLY_AVAILABLE",
                2,
              ],
              [
                "BACKORDERED",
                1,
              ],
            ]),
        });

      await backdate(
        order,
        createdAt,
      );

      quotation.orderId =
        order._id;

      await quotation.save({
        timestamps: false,
      });

      orderDocs.push({
        doc: order,
        createdAt,
      });
    }

    // Standalone orders
    for (
      let i = 0;
      i < STANDALONE_ORDER_COUNT;
      i++
    ) {
      const customer =
        randomPick(customers);

      const createdAt =
        randomDateBetween(
          customer.createdAt ??
            START_DATE,
          END_DATE,
        );

      const status =
        weightedPick<
          | "pending"
          | "confirmed"
          | "processing"
          | "shipped"
          | "delivered"
          | "cancelled"
        >([
          ["delivered", 4],
          ["shipped", 2],
          ["processing", 2],
          ["confirmed", 2],
          ["pending", 2],
          ["cancelled", 1],
        ]);

      const items: IOrderLineItem[] =
        generateLineItems(
          products,
          randomInt(1, 4),
        ) as IOrderLineItem[];

      const order =
        await OrderModel.create({
          number:
            nextOrderNumber(),

          customer:
            customer._id,

          items,

          status,

          notes:
            randomPick(
              NOTES_POOL,
            ),

          stockDecremented:
            status === "shipped" ||
            status === "delivered",

          reservedStock: false,

          fulfillmentStatus:
            "AVAILABLE",
        });

      await backdate(
        order,
        createdAt,
      );

      orderDocs.push({
        doc: order,
        createdAt,
      });
    }

    console.log(
      `Created ${orderDocs.length} orders (${acceptedQuotations.length} from quotations, ${STANDALONE_ORDER_COUNT} standalone).`,
    );

    // -----------------------------------------------------------------
    // Invoices
    // -----------------------------------------------------------------

    const nextInvoiceNumber =
      makeNumberGenerator(
        "INV",
      );

    const invoiceDocs: {
      doc: InstanceType<
        typeof InvoiceModel
      >;

      issueDate: Date;
    }[] = [];

    const invoiceableOrders =
      orderDocs.filter(
        (o) =>
          o.doc.status ===
            "shipped" ||
          o.doc.status ===
            "delivered",
      );

    for (const {
      doc: order,
      createdAt,
    } of invoiceableOrders) {
      if (
        Math.random() < 0.15
      ) {
        continue;
      }

      const issueDate =
        randomDateAfter(
          createdAt,
          0,
          2,
        );

      const dueDate =
        addDays(
          issueDate,
          randomInt(7, 30),
        );

      const items: IInvoiceLineItem[] =
        order.items.map(
          (item) => ({
            productId:
              item.productId,

            name: item.name,

            description:
              item.description,

            variantSku:
              item.variantSku,

            size:
              item.size,

            quantity:
              item.quantity,

            unitPrice:
              item.unitPrice,

            taxRate:
              item.taxRate,

            discount:
              item.discount,
          }),
        );

      const { total } =
        calculateInvoiceTotals(
          items,
        );

      const isOverdueByDate =
        dueDate.getTime() <
        END_DATE.getTime();

      const status =
        weightedPick<
          | "paid"
          | "partially_paid"
          | "unpaid"
          | "overdue"
          | "cancelled"
        >(
          isOverdueByDate
            ? [
                ["paid", 5],
                ["overdue", 3],
                [
                  "partially_paid",
                  2,
                ],
                [
                  "cancelled",
                  1,
                ],
              ]
            : [
                ["paid", 4],
                [
                  "partially_paid",
                  2,
                ],
                ["unpaid", 3],
              ],
        );

      const amountPaid =
        status === "paid"
          ? total
          : status ===
              "partially_paid"
            ? Math.round(
                total *
                  (0.3 +
                    Math.random() *
                      0.4) *
                  100,
              ) / 100
            : 0;

      const invoice =
        await InvoiceModel.create(
          {
            number:
              nextInvoiceNumber(),

            customer:
              order.customer,

            items,

            status,

            issueDate,

            dueDate,

            amountPaid,

            notes:
              randomPick(
                NOTES_POOL,
              ),

            terms:
              randomPick(
                TERMS_POOL,
              ),

            orderId:
              order._id,

            quotationId:
              order.quotationId,
          },
        );

      await backdate(
        invoice,
        issueDate,
      );

      order.invoiceId =
        invoice._id;

      await order.save({
        timestamps: false,
      });

      invoiceDocs.push({
        doc: invoice,
        issueDate,
      });
    }

    // Standalone invoices
    for (
      let i = 0;
      i < STANDALONE_INVOICE_COUNT;
      i++
    ) {
      const customer =
        randomPick(customers);

      const issueDate =
        randomDateBetween(
          customer.createdAt ??
            START_DATE,
          END_DATE,
        );

      const dueDate =
        addDays(
          issueDate,
          randomInt(7, 30),
        );

      const items: IInvoiceLineItem[] =
        generateLineItems(
          products,
          randomInt(1, 4),
        ) as IInvoiceLineItem[];

      const { total } =
        calculateInvoiceTotals(
          items,
        );

      const status =
        weightedPick<
          | "draft"
          | "paid"
          | "partially_paid"
          | "unpaid"
          | "overdue"
          | "cancelled"
        >([
          ["draft", 1],
          ["unpaid", 2],
          [
            "partially_paid",
            2,
          ],
          ["paid", 3],
          ["overdue", 2],
          ["cancelled", 1],
        ]);

      const amountPaid =
        status === "paid"
          ? total
          : status ===
              "partially_paid"
            ? Math.round(
                total *
                  (0.3 +
                    Math.random() *
                      0.4) *
                  100,
              ) / 100
            : 0;

      const invoice =
        await InvoiceModel.create(
          {
            number:
              nextInvoiceNumber(),

            customer:
              customer._id,

            items,

            status,

            issueDate,

            dueDate,

            amountPaid,

            notes:
              randomPick(
                NOTES_POOL,
              ),

            terms:
              randomPick(
                TERMS_POOL,
              ),
          },
        );

      await backdate(
        invoice,
        issueDate,
      );

      invoiceDocs.push({
        doc: invoice,
        issueDate,
      });
    }

    console.log(
      `Created ${invoiceDocs.length} invoices.`,
    );

    // -----------------------------------------------------------------
    // Payments
    // -----------------------------------------------------------------

    let paymentsCreated = 0;

    for (const {
      doc: invoice,
      issueDate,
    } of invoiceDocs) {
      if (
        invoice.status !==
          "paid" &&
        invoice.status !==
          "partially_paid"
      ) {
        continue;
      }

      if (
        invoice.amountPaid <= 0
      ) {
        continue;
      }

      const installments =
        invoice.status ===
          "paid" &&
        Math.random() > 0.5
          ? 2
          : 1;

      let remaining =
        invoice.amountPaid;

      for (
        let i = 0;
        i < installments;
        i++
      ) {
        const isLast =
          i ===
          installments - 1;

        const amount = isLast
          ? remaining
          : Math.round(
              (remaining *
                randomInt(
                  30,
                  70,
                )) /
                100 *
                100,
            ) / 100;

        remaining =
          Math.round(
            (remaining -
              amount) *
              100,
          ) / 100;

        if (amount <= 0) {
          continue;
        }

        const method =
          weightedPick<
            "cash" | "mpesa"
          >([
            ["mpesa", 3],
            ["cash", 1],
          ]);

        const paymentDate =
          randomDateAfter(
            issueDate,
            0,
            20,
          );

        const payment =
          await PaymentModel.create(
            {
              invoiceId:
                invoice._id,

              amount,

              method,

              reference:
                method ===
                "mpesa"
                  ? `Q${randomInt(
                      10,
                      99,
                    )}${String.fromCharCode(
                      65 +
                        randomInt(
                          0,
                          25,
                        ),
                    )}${randomInt(
                      100000,
                      999999,
                    )}`
                  : undefined,

              date: paymentDate,

              recordedBy:
                "Seed Script",

              status:
                "recorded",
            },
          );

        await backdate(
          payment,
          paymentDate,
        );

        paymentsCreated++;
      }
    }

    console.log(
      `Created ${paymentsCreated} payments.`,
    );

    // -----------------------------------------------------------------
    // Stock Movements for CRM Orders
    // -----------------------------------------------------------------

    let movementsCreated = 0;

    const stockSnapshot =
      new Map(
        rawProducts.map(
          (p) => [
            String(p._id),
            p.stock,
          ],
        ),
      );

    for (const {
      doc: order,
      createdAt,
    } of orderDocs) {
      if (
        order.status !==
          "shipped" &&
        order.status !==
          "delivered"
      ) {
        continue;
      }

      for (const item of order.items) {
        if (!item.productId) {
          continue;
        }

        const current =
          stockSnapshot.get(
            item.productId,
          ) ?? 0;

        const resultingStock =
          Math.max(
            0,
            current -
              item.quantity,
          );

        stockSnapshot.set(
          item.productId,
          resultingStock,
        );

        const movement =
          await MovementModel.create(
            {
              product:
                item.productId,

              type:
                "order_shipped",

              delta:
                -item.quantity,

              resultingStock,

              reference:
                order.number,
            },
          );

        await backdate(
          movement,
          randomDateAfter(
            createdAt,
            0,
            3,
          ),
        );

        movementsCreated++;
      }
    }

    // -----------------------------------------------------------------
    // Storefront StoreOrders
    // -----------------------------------------------------------------

    const nextStoreOrderNumber =
      makeNumberGenerator(
        "SORD",
      );

    let storeOrdersCreated = 0;

    for (
      let i = 0;
      i < STORE_ORDER_COUNT;
      i++
    ) {
      const createdAt =
        randomBusinessDate();

      const buyerName =
        randomPersonName();

      const chosenProducts =
        randomSubset(
          products,
          1,
          4,
        );

      const items: IStoreOrderItem[] =
        chosenProducts.map(
          (product) => {
            const {
              unitPrice,
              variantSku,
              size,
            } =
              pickPriceAndVariant(
                product,
              );

            const quantity =
              randomInt(1, 5);

            return {
              product:
                new mongoose.Types.ObjectId(
                  product.id,
                ),

              name: product.name,

              sku: product.sku,

              variantSku,

              size,

              price: unitPrice,

              quantity,

              subtotal:
                Math.round(
                  unitPrice *
                    quantity *
                    100,
                ) / 100,
            };
          },
        );

      const subtotal =
        Math.round(
          items.reduce(
            (sum, item) =>
              sum +
              item.subtotal,
            0,
          ) * 100,
        ) / 100;

      const shippingFee =
        subtotal > 5000
          ? 0
          : randomPick([
              300,
              500,
              700,
            ]);

      const tax =
        Math.round(
          subtotal *
            0.16 *
            100,
        ) / 100;

      const total =
        Math.round(
          (subtotal +
            shippingFee +
            tax) *
            100,
        ) / 100;

      const status =
        weightedPick<
          | "pending"
          | "confirmed"
          | "processing"
          | "shipped"
          | "delivered"
          | "cancelled"
        >([
          ["delivered", 5],
          ["shipped", 2],
          ["processing", 2],
          ["confirmed", 2],
          ["pending", 2],
          ["cancelled", 1],
        ]);

      const paymentMethod =
        weightedPick<
          "mpesa" | "cod"
        >([
          ["mpesa", 3],
          ["cod", 2],
        ]);

      const paymentStatus =
        status === "cancelled"
          ? weightedPick<
              | "pending"
              | "failed"
              | "refunded"
            >([
              ["failed", 1],
              ["refunded", 1],
            ])
          : paymentMethod ===
              "mpesa"
            ? "paid"
            : status ===
                  "delivered" ||
                status ===
                  "shipped"
              ? "paid"
              : "pending";

      const storeOrder =
        await StoreOrderModel.create(
          {
            orderNumber:
              nextStoreOrderNumber(),

            sessionId:
              `seed-session-${i}-${Date.now()}`,

            items,

            subtotal,

            shippingFee,

            tax,

            total,

            status,

            paymentStatus,

            paymentMethod,

            customer: {
              name: buyerName,

              email:
                randomEmail(
                  buyerName,
                ),

              phone:
                randomPhone(),
            },

            shippingAddress:
              randomAddress(),

            stockDecremented:
              status ===
                "shipped" ||
              status ===
                "delivered",
          },
        );

      await backdate(
        storeOrder,
        createdAt,
      );

      storeOrdersCreated++;

      if (
        status === "shipped" ||
        status === "delivered"
      ) {
        for (const item of items) {
          if (!item.product) {
            continue;
          }

          const key = String(
            item.product,
          );

          const current =
            stockSnapshot.get(
              key,
            ) ?? 0;

          const resultingStock =
            Math.max(
              0,
              current -
                item.quantity,
            );

          stockSnapshot.set(
            key,
            resultingStock,
          );

          const movement =
            await MovementModel.create(
              {
                product:
                  item.product,

                type:
                  "store_order_shipped",

                delta:
                  -item.quantity,

                resultingStock,

                reference:
                  storeOrder.orderNumber,
              },
            );

          await backdate(
            movement,
            randomDateAfter(
              createdAt,
              0,
              2,
            ),
          );

          movementsCreated++;
        }
      }
    }

    console.log(
      `Created ${storeOrdersCreated} storefront orders.`,
    );

    console.log(
      `Created ${movementsCreated} stock movements.`,
    );

    // -----------------------------------------------------------------
    // Finish
    // -----------------------------------------------------------------

    console.log(
      "\nSeed completed.",
    );

    console.log(
      "Period:          January 1, 2026 - September 3, 2026",
    );

    console.log(
      `Customers:        ${customers.length}`,
    );

    console.log(
      `Quotations:       ${quotationDocs.length}`,
    );

    console.log(
      `Orders:           ${orderDocs.length}`,
    );

    console.log(
      `Invoices:         ${invoiceDocs.length}`,
    );

    console.log(
      `Payments:         ${paymentsCreated}`,
    );

    console.log(
      `Store orders:     ${storeOrdersCreated}`,
    );

    console.log(
      `Stock movements:  ${movementsCreated}`,
    );
  } finally {
    await mongoose.disconnect();

    console.log(
      "\nDisconnected from MongoDB.",
    );
  }
}

seed().catch(
  (error: unknown) => {
    console.error(
      "Seed failed:",
      error,
    );

    process.exit(1);
  },
);