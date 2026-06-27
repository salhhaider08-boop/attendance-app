"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addEmployee(formData: FormData) {
  const name = formData.get("name") as string;
  const basicSalary = parseFloat(formData.get("basicSalary") as string);
  const allowance = parseFloat(formData.get("allowance") as string) || 100000;

  if (!name || isNaN(basicSalary)) {
    throw new Error("الاسم والراتب الاسمي مطلوبان");
  }

  await prisma.employee.create({
    data: { name, basicSalary, allowance }
  });

  revalidatePath("/employees");
  revalidatePath("/");
}

export async function updateEmployee(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const basicSalary = parseFloat(formData.get("basicSalary") as string);
  const allowance = parseFloat(formData.get("allowance") as string) || 100000;

  if (!id || isNaN(basicSalary)) {
    throw new Error("بيانات غير صالحة");
  }

  await prisma.employee.update({
    where: { id },
    data: { basicSalary, allowance }
  });

  revalidatePath("/employees");
}

export async function deleteEmployee(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  await prisma.employee.delete({
    where: { id }
  });
  revalidatePath("/employees");
  revalidatePath("/");
}
