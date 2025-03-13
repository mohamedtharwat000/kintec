import { prisma } from "@/lib/prisma";

export const createProject = async (data: {
  project_name: string;
  project_type: string;
  project_id?: string;
}) => {
  return prisma.project.create({
    data: {
      ...data,
      project_id: data.project_id || undefined,
    },
  });
};

export const getProjectById = async (id: string) => {
  return prisma.project.findUnique({
    where: { project_id: id },
    include: {
      contracts: true,
      project_rules: true,
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

export const getAllProjects = async () => {
  return prisma.project.findMany({
    include: {
      contracts: true,
      project_rules: true,
    },
  });
};

export const createProjects = async (
  data: Array<{
    project_name: string;
    project_type: string;
    project_id?: string;
  }>
) => {
  return prisma.$transaction(async (prisma) => {
    const projects = [];

    for (const projectData of data) {
      const project = await prisma.project.create({
        data: {
          ...projectData,
          project_id: projectData.project_id || undefined,
        },
      });

      projects.push(project);
    }

    return projects;
  });
};
