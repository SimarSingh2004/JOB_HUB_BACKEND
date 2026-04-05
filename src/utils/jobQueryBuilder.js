import { ApiError } from "./ApiError.js";

const buildJobFilter = (queryParams = {}) => {
  const filter = {};

  if (queryParams.location?.trim()) {
    filter.location = queryParams.location.trim().toLowerCase();
  }

  if (queryParams.salary) {
    const salaryFilter = {};

    const salaryInput = queryParams.salary;
    const minSalary = Number(salaryInput.min);
    const maxSalary = Number(salaryInput.max);

    if (salaryInput.min !== undefined && !Number.isNaN(minSalary)) {
      salaryFilter.$gte = minSalary;
    }

    if (salaryInput.max !== undefined && !Number.isNaN(maxSalary)) {
      salaryFilter.$lte = maxSalary;
    }

    if (
      salaryInput.min !== undefined &&
      salaryInput.max !== undefined &&
      !Number.isNaN(minSalary) &&
      !Number.isNaN(maxSalary) &&
      minSalary > maxSalary
    ) {
      throw new ApiError(400, "Min salary cannot be greater than max salary");
    }

    // Only add salary filter if at least one of min or max is valid.
    if (Object.keys(salaryFilter).length > 0) {
      filter.salary = salaryFilter;
    }
  }

  const skills = [
    ...new Set(
      (queryParams.skills?.split(",") || [])
        .map((skill) => skill.trim().toLowerCase())
        .filter(Boolean),
    ),
  ]; // Remove duplicates, trim, lowercase and "filter out empty strings by  filter(Boolean)"

  if (skills.length > 0) filter.skillsRequired = { $in: skills };

  if (queryParams.search?.trim()) {
    const search = queryParams.search.trim();
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { title: { $regex: safeSearch, $options: "i" } }, // regex for partial match and i for case insensitive
      { description: { $regex: safeSearch, $options: "i" } }, // i for case insensitive
    ];
  }
  return filter;
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const ALLOWED_SORT_FIELDS = new Set([
  "createdAt",
  "updatedAt",
  "salary",
  "title",
  "location",
]);

const buildSort = (queryParams) => {
  const sortFields = queryParams.sort?.split(",") || [];
  const sort = {};

  sortFields.forEach((field) => {
    const normalizedField = field.trim();
    if (!normalizedField) return;

    const sortKey = normalizedField.startsWith("-")
      ? normalizedField.slice(1)
      : normalizedField;

    if (!ALLOWED_SORT_FIELDS.has(sortKey)) return;

    if (sort[sortKey] !== undefined) return;

    sort[sortKey] = normalizedField.startsWith("-") ? -1 : 1;
  });

  if (Object.keys(sort).length === 0) sort.createdAt = -1; // Default sort by newest

  return sort;
};

export { buildJobFilter, buildSort };
