import { contract_status } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const createContract = async (data: {
  contractor_id: string;
  client_company_id: string;
  project_id: string;
  contract_start_date: string;
  contract_end_date: string;
  job_title: string;
  job_type: string;
  job_number: string;
  kintec_cost_centre_code: string;
  description_of_services: string;
  contract_status: contract_status;
}) => {
  return prisma.contract.create({
    data: {
      contractor: { connect: { contractor_id: data.contractor_id } },
      client_company: {
        connect: { client_company_id: data.client_company_id },
      },
      project: { connect: { project_id: data.project_id } },
      contract_start_date: new Date(data.contract_start_date),
      contract_end_date: new Date(data.contract_end_date),
      job_title: data.job_title,
      job_type: data.job_type,
      job_number: data.job_number,
      kintec_cost_centre_code: data.kintec_cost_centre_code,
      description_of_services: data.description_of_services,
      contract_status: data.contract_status,
    },
  });
};

export const getContractById = async (id: string) => {
  return prisma.contract.findUnique({
    where: { contract_id: id },
    include: {
      contractor: true,
      client_company: true,
      project: true,
      purchase_order: true,
      calloff_work_orders: true,
    },
  });
};

export const updateContract = async (id: string, data: any) => {
  const {
    contractor_id,
    client_company_id,
    project_id,
    contract_start_date,
    contract_end_date,
    ...rest
  } = data;

  return prisma.contract.update({
    where: { contract_id: id },
    data: {
      ...rest,
      ...(contractor_id && { contractor: { connect: { contractor_id } } }),
      ...(client_company_id && {
        client_company: { connect: { client_company_id } },
      }),
      ...(project_id && { project: { connect: { project_id } } }),
      ...(contract_start_date && {
        contract_start_date: new Date(contract_start_date),
      }),
      ...(contract_end_date && {
        contract_end_date: new Date(contract_end_date),
      }),
    },
  });
};

export const deleteContract = async (id: string) => {
  return prisma.contract.delete({
    where: { contract_id: id },
  });
};

export const getAllContracts = async () => {
  return prisma.contract.findMany({
    include: {
      contractor: true,
      client_company: true,
      project: true,
      purchase_order: true,
      calloff_work_orders: true,
    },
  });
};

export const createContracts = async (
  data: Array<{
    contractor_id: string;
    client_company_id: string;
    project_id: string;
    contract_start_date: string;
    contract_end_date: string;
    job_title: string;
    job_type: string;
    job_number: string;
    kintec_cost_centre_code: string;
    description_of_services: string;
    contract_status: contract_status;
  }>
) => {
  const contracts = [];

  for (const contractData of data) {
    const contract = await createContract(contractData);
    contracts.push(contract);
  }

  return contracts;
};
