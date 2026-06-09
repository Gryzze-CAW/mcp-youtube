import { z } from "zod";
import { BaseTool } from "../base.js";
import { formatSuccess } from "../../utils/responseFormatter.js";
import { channelIdSchema, maxResultsSchema } from "../../utils/validation.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export const getChannelRecentVideosSchema = z.object({
  channelId: channelIdSchema.describe(
    "YouTube channel ID to get recent videos from"
  ),
  maxResults: maxResultsSchema
    .optional()
    .default(10)
    .describe("Maximum number of videos to return (1-500, default: 10)"),
  maxDays: z
    .number()
    .min(1)
    .max(365)
    .optional()
    .default(30)
    .describe(
      "How many days back to look for videos (1-365, default: 30). Videos published before this window are excluded."
    ),
  includeTags: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "Specify 'true' to include the video's 'tags' array in the response, which is useful for extracting niche keywords. The 'tags' are omitted by default to conserve tokens."
    ),
  descriptionDetail: z
    .enum(["NONE", "SNIPPET", "LONG"])
    .optional()
    .default("NONE")
    .describe(
      "Controls video description detail to manage token cost. Options: 'NONE' (default, no text), 'SNIPPET' (a brief preview for broad scans), 'LONG' (a 500-char text for deep analysis of specific targets)."
    ),
});

export class GetChannelRecentVideosTool extends BaseTool<
  typeof getChannelRecentVideosSchema
> {
  name = "getChannelRecentVideos";
  description =
    "Retrieves a channel's most recently published videos, ordered by publish date (newest first). Use this to monitor new uploads or check recent activity. CRITICAL: Requires a valid `channelId` (starting with 'UC...'), NOT a channel handle or name. Use `searchVideos` (type='channel') first to find the `channelId` if you only have a name.";
  schema = getChannelRecentVideosSchema;

  protected async executeImpl(
    params: z.infer<typeof getChannelRecentVideosSchema>
  ): Promise<CallToolResult> {
    const recentVideos =
      await this.container.youtubeService.getChannelRecentVideos(params);

    return formatSuccess(recentVideos);
  }
}
