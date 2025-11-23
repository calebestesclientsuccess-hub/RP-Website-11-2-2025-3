export function normalizeFormData(
  formData: unknown,
): { value: string | undefined } {
  if (formData === undefined || formData === null || formData === "") {
    return { value: undefined };
  }

  if (typeof formData === "string") {
    const parsed = JSON.parse(formData);
    return { value: JSON.stringify(parsed) };
  }

  if (typeof formData === "object") {
    return { value: JSON.stringify(formData) };
  }

  throw new Error("formData must be a JSON string or object");
}

