"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addEmployee(formData: FormData) {
  const name = formData.get("name") as string;
  const basicSalary = parseFloat(formData.get("basicSalary") as string);
  const allowance = parseFloat(formData.get("allowance") as string) || 100000;

  if (!name || isNaN(basicSalary)) {
    return { error: "الاسم والراتب الاسمي مطلوبان" };
  }

  try {
    await prisma.employee.create({
      data: { name, basicSalary, allowance }
    });

    revalidatePath("/employees");
    revalidatePath("/");
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "هذا الاسم موجود مسبقاً، الرجاء اختيار اسم آخر" };
    }
    return { error: "حدث خطأ أثناء إضافة الموظف" };
  }
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
