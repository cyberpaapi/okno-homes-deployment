export function indicativePrice(value = ""): string {
  const price = value.trim();
  if (!price || /on request/i.test(price) || /^indicative\b/i.test(price)) return price;
  return `Indicative ${price.replace(/^₹\s*/, "₹ ")}`;
}

export function planLabel(value = ""): string {
  return value.replace(/2 BHK/gi, "Two-bedroom").replace(/3 BHK/gi, "Three-bedroom");
}
