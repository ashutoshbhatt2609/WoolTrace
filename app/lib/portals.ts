import {
  Factory, FlaskConical, HandCoins, Landmark, PackageCheck,
  Scissors, ShoppingBag, Store, Truck, Warehouse,
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
    description: "Declare the farm source, complete shearing with a photo and decide which buyer wins.",
    actions: ["Complete shearing with photo", "Update farm or flock details", "Set reserve price", "Accept a reverse bid"],
    owns: ["Farm origin", "Shearing", "Sale acceptance"],
  },
  buyer: {
    name: "Buyer portal", short: "Buyer", icon: HandCoins,
    description: "Search traceable wool, compare recorded quality and place transparent offers.",
    actions: ["Find graded wool", "Place or revise a bid", "Confirm payment terms", "Accept delivery"],
    owns: ["Bid", "Purchase", "Delivery acceptance"],
  },
  laboratory: {
    name: "Laboratory portal", short: "Laboratory", icon: FlaskConical,
    description: "Add sample receipt and measured fibre results to the batches assigned to your email.",
    actions: ["Receive a sample", "Enter test measurements", "Attach a result reference", "Record assigned grade"],
    owns: ["Micron result", "Staple result", "Quality result"],
  },
  transporter: {
    name: "Logistics workspace", short: "Transporter", icon: Truck,
    description: "Record pickup and delivery for the wool assigned to you, with the date, location and handover notes.",
    actions: ["Review assigned wool", "Record pickup", "Record delivery", "Read the wool passport"],
    owns: ["Pickup", "Delivery"],
  },
  warehouse: {
    name: "Warehouse portal", short: "Warehouse", icon: Warehouse,
    description: "Keep a dated record of wool arriving at and leaving your facility.",
    actions: ["Review assigned wool", "Record storage intake", "Add storage notes", "Record storage release"],
    owns: ["Storage intake", "Storage release"],
  },
  processor: {
    name: "Processor portal", short: "Processor", icon: Factory,
    description: "Connect raw wool to scoured fibre, yarn, fabric and every resulting lot.",
    actions: ["Receive source batch", "Record scouring yield", "Create yarn child lots", "Link fabric production"],
    owns: ["Scouring", "Carding", "Spinning", "Weaving", "Dyeing", "Output lots"],
  },
  brand: {
    name: "Brand & retail portal", short: "Brand / retail", icon: Store,
    description: "Link finished products to their source wool and share the recorded journey with customers.",
    actions: ["Receive fabric lot", "Register finished product", "Open product QR", "Publish provenance story"],
    owns: ["Manufacturing", "Product identity", "Retail verification"],
  },
} as const;

export type PortalRole = keyof typeof portalDefinitions;
export const portalRoles = Object.keys(portalDefinitions) as PortalRole[];
export const isPortalRole = (value: string): value is PortalRole => portalRoles.includes(value as PortalRole);
