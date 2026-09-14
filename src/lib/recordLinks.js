export function documentRoute(key, kategori) {
  if (!["bast", "pakta"].includes(key)) return key;
  const suffix = kategori === "Cash Card" ? "cc" : kategori === "PO" ? "po" : "nonpo";
  return `${key}-${suffix}`;
}

export function availablePaymentRabs(rab, records, kategori, editingId = null) {
  return rab.filter((r) => r.kategori === kategori && !records.some((p) => p.rabId === r.idNumber && p.id !== editingId));
}

export function duplicatePayment(records, rabId, editingId = null) {
  return records.some((r) => r.rabId === rabId && r.id !== editingId);
}

export function proposalDocuments(proposal, evaluations = []) {
  return {
    evaluasi: evaluations.find((e) => e.proposalId === proposal.id) || null,
    bast: proposal.bast && Object.values(proposal.bast).some((v) => v !== "" && v != null) ? proposal.bast : null,
    pi: proposal.pakta && Object.values(proposal.pakta).some((v) => v !== "" && v != null) ? proposal.pakta : null,
  };
}
