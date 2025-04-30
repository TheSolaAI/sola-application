import { ToolContext, ToolSetDescription } from '@/types/tool';
import { createRequestFeatureTool } from './requestFeatureTool';
import { createReportBugTool } from './reportBugTool';

export const managementToolSet: ToolSetDescription = {
  slug: 'management',
  name: 'management_tools',
  description:
    'Management tools for the application such as creating a bug report (not submitting it), a feature request  (not submitting it), general feedback, contacting the devs etc.',
};

export const getManagementToolSet = (context: ToolContext) => {
  return {
    ...managementToolSet,
    tools: {
      requestFeature: createRequestFeatureTool(context),
      reportBug: createReportBugTool(context),
    },
  };
};
