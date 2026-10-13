/**
 * The /dynamicdashboard dashboard alias — parity round 31 (R31-B).
 *
 * REF's page registry maps this name to a component that renders the
 * Dashboard page (measured: identical body, 4 cards, "Welcome back"
 * h1, and the plain "Eon HR" title — NOT the mechanical slug title).
 * The clone re-exports the dashboard's server page component.
 */
export { default } from "../dashboard/page";
export const dynamic = "force-dynamic";
