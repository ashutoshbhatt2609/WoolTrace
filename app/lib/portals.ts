import {
  BadgeCheck, Factory, FlaskConical, HandCoins, Landmark, PackageCheck,
  Scissors, ShieldCheck, ShoppingBag, Store, Truck, Warehouse,
} from "lucide-react";

export const woolStages = [
  { key: "origin", title: "Farm origin", owner: "Farmer", detail: "Farm, flock, breed and animal-welfare record", icon: Landmark },
  { key: "shearing", title: "Shearing", owner: "Farmer / shearer", detail: "Date, location, shearer and raw batch weight", icon: Scissors },
  { key: "sorting", title: "Sorting & grading", owner: "Assessor", detail: "Contamination, colour and preliminary grade", icon: PackageCheck },
  { key: "testing", title: "Laboratory testing", owner: "Laboratory", detail: "Micron, staple length, strength and clean yield", icon: FlaskConical },
  { key: "auction", title: "Reverse bidding", owner: "Buyer", detail: "Verified offers, payment terms and farmer acceptance", icon: HandCoins },
  { key: "transport", title: "Transport", owner: "Transporter", detail: "Pickup, seal, custody transfer and delivery proof", icon: Truck },
  { key: "storage", title: "Warehouse", owner: "Warehouse", detail: "Inbound weight, storage conditions and dispatch", icon: Warehouse },
  { key: "processing", title: "Scouring & spinning", owner: "Processor", detail: "Cleaning, yield loss, lot split and yarn conversion", icon: Factory },
  { key: "manufacturing", title: "Fabric & product", owner: "Manufacturer", detail: "Dyeing, weaving or knitting and finished product link", icon: Factory },
  { key: "retail", title: "Retail verification", owner: "Brand / customer", detail: "Final product QR proves its source wool", icon: ShoppingBag },
] as const;

export const portalDefinitions = {
  farmer: {
    name: "Farmer portal", short: "Farmer", icon: Scissors,
    description: "Register wool at shearing, own the source record and decide which buyer wins.",
    actions: ["Register a shearing batch", "Upload farm and flock proof", "Set reserve price", "Accept a reverse bid"],
    owns: ["Farm origin", "Shearing", "Sale acceptance"],
  },
  buyer: {
    name: "Buyer portal", short: "Buyer", icon: HandCoins,
    description: "Search verified wool, compare laboratory quality and place transparent offers.",
    actions: ["Find graded wool", "Place or revise a bid", "Confirm payment terms", "Accept delivery"],
    owns: ["Bid", "Purchase", "Delivery acceptance"],
  },
  laboratory: {
    name: "Laboratory portal", short: "Laboratory", icon: FlaskConical,
    description: "Record independently tested fibre measurements and sign quality certificates.",
    actions: ["Receive a sample", "Enter test measurements", "Upload certificate", "Approve assigned grade"],
    owns: ["Micron result", "Staple result", "Quality certificate"],
  },
  transporter: {
    name: "Transport portal", short: "Transporter", icon: Truck,
    description: "Manage pickup, sealed custody, route updates and proof of delivery.",
    actions: ["Accept a pickup", "Scan custody QR", "Post route checkpoint", "Capture delivery proof"],
    owns: ["Pickup", "Transit", "Delivery"],
  },
  warehouse: {
    name: "Warehouse portal", short: "Warehouse", icon: Warehouse,
    description: "Verify inbound lots, monitor storage and release only authorized batches.",
    actions: ["Scan inbound batch", "Record received weight", "Monitor storage conditions", "Authorize dispatch"],
    owns: ["Warehouse receipt", "Storage", "Dispatch"],
  },
  processor: {
    name: "Processor portal", short: "Processor", icon: Factory,
    description: "Connect raw wool to scoured fibre, yarn, fabric and every resulting lot.",
    actions: ["Receive source batch", "Record scouring yield", "Create yarn child lots", "Link fabric production"],
    owns: ["Scouring", "Spinning", "Weaving or knitting"],
  },
  brand: {
    name: "Brand & retail portal", short: "Brand / retail", icon: Store,
    description: "Attach source wool to finished products and publish customer-facing proof.",
    actions: ["Receive fabric lot", "Register finished product", "Generate product QR", "Publish provenance story"],
    owns: ["Manufacturing", "Product identity", "Retail verification"],
  },
  admin: {
    name: "Admin portal", short: "Admin", icon: ShieldCheck,
    description: "Verify organizations, investigate exceptions and audit the full chain of custody.",
    actions: ["Verify a stakeholder", "Review disputed events", "Suspend suspicious records", "Export audit trail"],
    owns: ["Verification", "Compliance", "Audit"],
  },
} as const;

export type PortalRole = keyof typeof portalDefinitions;
export const portalRoles = Object.keys(portalDefinitions) as PortalRole[];
export const isPortalRole = (value: string): value is PortalRole => portalRoles.includes(value as PortalRole);
