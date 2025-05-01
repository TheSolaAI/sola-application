import { ToolContext, ToolSetDescription } from '@/types/tool';
import { createRequestFeatureTool } from './requestFeatureTool';
import { createReportBugTool } from './reportBugTool';
import { z } from 'zod';
export const managementToolSet: ToolSetDescription = {
  slug: 'management',
  name: 'management_tools',
  description:
    'Management tools for the application such as creating a bug report (not submitting it), a feature request  (not submitting it), general feedback, contacting the devs and changing any application settings',
};

export const getManagementToolSet = (context: ToolContext) => {
  return {
    ...managementToolSet,
    tools: {
      requestFeature: createRequestFeatureTool(context),
      reportBug: createReportBugTool(context),
      changeTheme: {
        description: 'Change the theme of the application',
        parameters: z.object({
          themeName: z
            .enum([
              'light',
              'dark',
              'materialDark',
              'softPastel',
              'warmSunrise',
              'tokyoTwilight',
              'monokaiMidnight',
              'custom',
            ])
            .describe('Name of the theme to be applied'),
        }),
      },
    },
  };
};
