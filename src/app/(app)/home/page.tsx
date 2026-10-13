"use client";

/**
 * The /home blank stub — parity round 31 (R31-C).
 *
 * REF's page registry serves this route but its component renders
 * NOTHING in main (measured twice with settle; ?id= params change
 * nothing; a path segment falls through to REF's own 404). The clone
 * replicates the blank render — the shell chrome still paints around it.
 */
export default function HomePage() {
  return null;
}
