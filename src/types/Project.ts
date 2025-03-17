import { project, contract, project_rule } from "@prisma/client";

export type Project = project;

export type ProjectView = Project & {
  contracts?: contract[];
  project_rules?: project_rule[];
};

export type MakePropertyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type APIProjectData = MakePropertyOptional<Project, "project_id">;
