import { type PortalRole, isPortalRole } from "./portals";

// One definition drives navigation, route access, dashboard copy and demo tasks.
export const workspaces: Record<PortalRole, {
  title: string; subtitle: string; headline: string; description: string;
  primary: [string, string]; batchLabel: string; modules: string[];
  steps: string[]; demoActions: string[];
}> = {
  farmer: {
    title: "Farmer workspace", subtitle: "GROW. RECORD. SELL.", headline: "Your wool. Your next chapter.",
    description: "Keep your shearing records together, find buyers and stay in control of your sale.",
    primary: ["Register wool", "/workspace/my-wool"], batchLabel: "Farm batches",
    modules: ["my-wool", "reverse-bidding", "traceability", "services", "market-prices"],
    steps: ["Register your farm and source batch.", "Complete shearing with the date, weight and photo.", "List your wool and compare buyer offers.", "Confirm received payment before transferring ownership."],
    demoActions: ["Register sample batch", "Complete sample shearing", "List sample wool", "Accept sample offer"],
  },
  buyer: {
    title: "Buyer workspace", subtitle: "DISCOVER. COMPARE. SOURCE.", headline: "Good wool starts with a clear source.",
    description: "Explore farmer listings, follow your offers and keep every purchase connected to its origin.",
    primary: ["Browse wool", "/workspace/woolkart"], batchLabel: "Purchased wool",
    modules: ["woolkart", "reverse-bidding", "my-wool", "traceability", "services"],
    steps: ["Browse listed batches and read their passports.", "Offer a price and agree on collection terms.", "Pay the seller directly after your offer is accepted.", "Record receipt and invite your processing partners."],
    demoActions: ["Inspect sample listing", "Place sample offer", "Simulate seller acceptance", "Record sample receipt"],
  },
  laboratory: {
    title: "Laboratory workspace", subtitle: "RECEIVE. MEASURE. RECORD.", headline: "Give every fibre a clearer record.",
    description: "Work on invited batches, record sample receipt and publish measured fibre results.",
    primary: ["Enter measurements", "/workspace/quality"], batchLabel: "Assigned samples",
    modules: ["quality", "traceability"],
    steps: ["Ask the batch owner to invite your Google email.", "Select the assigned batch and record sample receipt.", "Enter the grade, micron and staple length.", "Check the measurements on the public passport."],
    demoActions: ["Receive sample", "Record sample measurements", "Review sample results"],
  },
  transporter: {
    title: "Transport workspace", subtitle: "COLLECT. MOVE. DELIVER.", headline: "Keep the handoff connected.",
    description: "See assigned wool, record pickups and deliveries, and carry the source record with every batch.",
    primary: ["Record a handoff", "/portal/transporter"], batchLabel: "Assigned shipments",
    modules: ["traceability"],
    steps: ["Get invited by the current batch owner.", "Check the assigned batch and collection details.", "Record pickup with the location and notes.", "Record delivery at the receiving location."],
    demoActions: ["Review sample shipment", "Record sample pickup", "Record sample delivery"],
  },
  warehouse: {
    title: "Warehouse workspace", subtitle: "RECEIVE. STORE. RELEASE.", headline: "A clear record, in and out.",
    description: "Manage stage records for the wool entrusted to your facility, from intake to release.",
    primary: ["Record storage activity", "/portal/warehouse"], batchLabel: "Assigned storage batches",
    modules: ["traceability"],
    steps: ["Get invited to a batch by its current owner.", "Check the incoming wool passport.", "Record intake and relevant storage notes.", "Record release when wool leaves the facility."],
    demoActions: ["Review sample intake", "Record sample storage intake", "Record sample storage release"],
  },
  processor: {
    title: "Processor workspace", subtitle: "TRANSFORM. LINK. TRACE.", headline: "New form. Same origin.",
    description: "Record processing stages and link clean wool, yarn and fabric lots back to their source batch.",
    primary: ["Record processing", "/portal/processor"], batchLabel: "Assigned source batches",
    modules: ["traceability"],
    steps: ["Get invited to the source batch.", "Record the processing stage you completed.", "Create an output lot within the parent’s available weight.", "Share the output lot’s source-linked QR passport."],
    demoActions: ["Record sample scouring", "Record sample spinning", "Create sample yarn lot"],
  },
  brand: {
    title: "Brand & retail workspace", subtitle: "CONNECT. FINISH. SHARE.", headline: "Let the product tell its story.",
    description: "Connect finished products to their source wool and give customers a readable journey.",
    primary: ["Create a product record", "/portal/brand"], batchLabel: "Connected source batches",
    modules: ["traceability"],
    steps: ["Get invited to the source batch.", "Review its source and processing records.", "Create a finished-product lot from the available wool.", "Share its QR passport with your customers."],
    demoActions: ["Review sample source", "Record sample finished product", "Create sample product lot"],
  },
};

export function workspaceFor(role: string) { return workspaces[isPortalRole(role) ? role : "farmer"]; }
export function canOpenModule(role: string, module: string) {
  return isPortalRole(role) && workspaces[role].modules.includes(module);
}
