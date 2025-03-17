import { prisma } from "@/lib/prisma";
import { Project, ProjectView, APIProjectData } from "@/types/Project";

export const getAllProjects = async (): Promise<ProjectView[]> => {
  return prisma.project.findMany({
    include: {
      contracts: true,
      project_rules: true,
    },
  });
};

export const getProjectById = async (
  id: string
): Promise<ProjectView | null> => {
  return prisma.project.findUnique({
    where: { project_id: id },
    include: {
      contracts: true,
      project_rules: true,
    },
  });
};

export const deleteProject = async (id: string): Promise<Project> => {
  return prisma.project.delete({
    where: { project_id: id },
  });
};

export const updateProject = async (
  id: string,
  data: Partial<Project>
): Promise<Project> => {
  return prisma.project.update({
    where: { project_id: id },
    data,
  });
};

export const createProject = async (
  data: APIProjectData | APIProjectData[]
): Promise<Project[]> => {
  const receivedData: APIProjectData[] = Array.isArray(data) ? data : [data];

  return Promise.all(
    receivedData.map((project) => {
      if (project.project_id === "") project.project_id = undefined;

      return prisma.project.create({
        data: project,
      });
    })
  );
};
