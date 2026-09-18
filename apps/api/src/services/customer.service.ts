import { Types } from "mongoose";
import { Customer } from "../models/Customer.model";
import { User } from "../models/User.model";
import { ApiError } from "../utils/ApiError";

export async function getOrCreateCustomer(userId: string) {
  let customer = await Customer.findOne({ user: userId });
  if (!customer) customer = await Customer.create({ user: userId, savedLocations: [] });
  return customer;
}

export async function getCustomerProfile(userId: string) {
  const [customer, user] = await Promise.all([getOrCreateCustomer(userId), User.findById(userId).select("name email role isActive")]);
  if (!user) throw ApiError.notFound("User account not found");
  return { user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role, isActive: user.isActive }, customer };
}

export async function updateCustomerProfile(userId: string, input: { phone?: string; alternatePhone?: string; companyName?: string }) {
  const customer = await getOrCreateCustomer(userId);
  Object.assign(customer, input);
  await customer.save();
  return getCustomerProfile(userId);
}

export async function listLocations(userId: string) {
  const customer = await getOrCreateCustomer(userId);
  return customer.savedLocations;
}

export async function createLocation(userId: string, input: Record<string, unknown>) {
  const customer = await getOrCreateCustomer(userId);
  customer.savedLocations.push(input as never);
  await customer.save();
  return customer.savedLocations[customer.savedLocations.length - 1];
}

export async function updateLocation(userId: string, locationId: string, input: Record<string, unknown>) {
  const customer = await getOrCreateCustomer(userId);
  const location = customer.savedLocations.find((item) => item._id.toString() === locationId);
  if (!location) throw ApiError.notFound("Saved location not found");
  Object.assign(location, input);
  await customer.save();
  return location;
}

export async function deleteLocation(userId: string, locationId: string) {
  if (!Types.ObjectId.isValid(locationId)) throw ApiError.notFound("Saved location not found");
  const customer = await getOrCreateCustomer(userId);
  const before = customer.savedLocations.length;
  customer.savedLocations = customer.savedLocations.filter((item) => item._id.toString() !== locationId);
  if (customer.savedLocations.length === before) throw ApiError.notFound("Saved location not found");
  await customer.save();
}

export async function listCustomers(page: number, limit: number, search?: string) {
  const filter = search ? { $or: [{ phone: { $regex: search, $options: "i" } }, { companyName: { $regex: search, $options: "i" } }] } : {};
  const [customers, total] = await Promise.all([Customer.find(filter).populate("user", "name email role isActive").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), Customer.countDocuments(filter)]);
  return { customers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}