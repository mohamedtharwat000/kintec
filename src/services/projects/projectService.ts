import { prisma } from "@/lib/prisma";

export const getAllProjects = async () => {
  return prisma.project.findMany();
};

export const getProjectById = async (id: string) => {
  return prisma.project.findUnique({
    where: { project_id: id },
  });
};

export const createProject = async (data: {
  project_name: string;
  project_type: string;
}) => {
  return prisma.project.create({
    data: {
      ...data,
    },
  });
};

export const updateProject = async (id: string, data: any) => {
  return prisma.project.update({
    where: { project_id: id },
    data,
  });
};

export const deleteProject = async (id: string) => {
  return prisma.project.delete({
    where: { project_id: id },
  });
};
