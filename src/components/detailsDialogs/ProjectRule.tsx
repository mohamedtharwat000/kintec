import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { ProjectRule } from "@/types/Project";

interface ProjectRuleDetailsProps {
  projectRule: ProjectRule;
  open: boolean;
  onClose: () => void;
}

export function ProjectRuleDetails({
  projectRule,
  open,
  onClose,
}: ProjectRuleDetailsProps) {
  const { data: projects = [] } = useProjects();

  const project = projects.find((p) => p.project_id === projectRule.project_id);
  const projectName = project?.project_name || "Unknown Project";

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Project Rule Details</DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 divide-y">
              <div className="px-4 py-3 bg-muted/30 flex justify-between items-center">
                <span className="text-sm font-medium">Rule ID</span>
                <span className="text-sm font-mono">
                  {projectRule.project_rule_id}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Project</span>
                <span className="text-sm">{projectName}</span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Reviewer Name</span>
                <span className="text-sm">
                  {projectRule.project_rules_reviewer_name || "Not assigned"}
                </span>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">
                  Additional Review Process
                </span>
                <Badge
                  variant={
                    projectRule.additional_review_process === "required"
                      ? "default"
                      : "outline"
                  }
                >
                  {projectRule.additional_review_process || "Not specified"}
                </Badge>
              </div>

              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">Major Project</span>
                <Badge
                  variant={
                    projectRule.major_project_indicator ? "default" : "outline"
                  }
                >
                  {projectRule.major_project_indicator ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </div>

          {projectRule.special_project_rules && (
            <div className="border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-muted/30">
                <span className="text-sm font-medium">
                  Special Project Rules
                </span>
              </div>
              <div className="p-4 whitespace-pre-wrap text-sm">
                {projectRule.special_project_rules}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
