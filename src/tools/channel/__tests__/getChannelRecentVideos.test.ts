import { GetChannelRecentVideosTool } from "../getChannelRecentVideos";
import type { YoutubeService } from "../../../services/youtube.service";
import { IServiceContainer } from "../../../container";

// Only mock the service
jest.mock("../../../services/youtube.service");

describe("GetChannelRecentVideosTool", () => {
  let mockYoutubeService: jest.Mocked<YoutubeService>;
  let tool: GetChannelRecentVideosTool;

  beforeEach(() => {
    mockYoutubeService = {
      getChannelRecentVideos: jest.fn(),
    } as unknown as jest.Mocked<YoutubeService>;

    const container = {
      youtubeService: mockYoutubeService,
    } as unknown as IServiceContainer;

    tool = new GetChannelRecentVideosTool(container);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(tool).toBeDefined();
    expect(tool.name).toBe("getChannelRecentVideos");
  });

  it("should return recent videos using default optional parameters", async () => {
    const mockResult = [
      { id: "vid1", title: "New Video 1" },
      { id: "vid2", title: "New Video 2" },
    ];
    mockYoutubeService.getChannelRecentVideos.mockResolvedValue(
      mockResult as any
    );

    const params = { channelId: "UC123" };
    const result = await tool.execute(params);

    // Assert defaults: maxResults=10, maxDays=30, includeTags=false, descriptionDetail=NONE
    expect(mockYoutubeService.getChannelRecentVideos).toHaveBeenCalledWith({
      channelId: "UC123",
      maxResults: 10,
      maxDays: 30,
      includeTags: false,
      descriptionDetail: "NONE",
    });

    expect(result.success).toBe(true);
    expect(JSON.parse(result.content[0].text as string)).toEqual(mockResult);
  });

  it("should correctly pass all provided optional parameters", async () => {
    const mockResult = [{ id: "vid1", title: "Tagged Video" }];
    mockYoutubeService.getChannelRecentVideos.mockResolvedValue(
      mockResult as any
    );

    const params = {
      channelId: "UC123",
      maxResults: 5,
      maxDays: 7,
      includeTags: true,
      descriptionDetail: "SNIPPET" as const,
    };

    await tool.execute(params);

    expect(mockYoutubeService.getChannelRecentVideos).toHaveBeenCalledWith({
      channelId: "UC123",
      maxResults: 5,
      maxDays: 7,
      includeTags: true,
      descriptionDetail: "SNIPPET",
    });
  });

  it("should return an empty array when the channel has no recent videos", async () => {
    mockYoutubeService.getChannelRecentVideos.mockResolvedValue([]);

    const params = { channelId: "UC123" };
    const result = await tool.execute(params);

    expect(result.success).toBe(true);
    expect(JSON.parse(result.content[0].text as string)).toEqual([]);
  });

  it("should return a validation error for an invalid channelId", async () => {
    const params = { channelId: "" };
    const result = await tool.execute(params);

    expect(mockYoutubeService.getChannelRecentVideos).not.toHaveBeenCalled();
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/channelId/);
  });

  it("should return a validation error if maxResults is less than 1", async () => {
    const params = { channelId: "UC123", maxResults: 0 };
    const result = await tool.execute(params);

    expect(mockYoutubeService.getChannelRecentVideos).not.toHaveBeenCalled();
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("maxResults");
  });

  it("should return a validation error if maxResults is greater than 500", async () => {
    const params = { channelId: "UC123", maxResults: 501 };
    const result = await tool.execute(params);

    expect(mockYoutubeService.getChannelRecentVideos).not.toHaveBeenCalled();
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("maxResults");
  });

  it("should return a validation error if maxDays is less than 1", async () => {
    const params = { channelId: "UC123", maxDays: 0 };
    const result = await tool.execute(params);

    expect(mockYoutubeService.getChannelRecentVideos).not.toHaveBeenCalled();
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("maxDays");
  });

  it("should return a validation error if maxDays is greater than 365", async () => {
    const params = { channelId: "UC123", maxDays: 366 };
    const result = await tool.execute(params);

    expect(mockYoutubeService.getChannelRecentVideos).not.toHaveBeenCalled();
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("maxDays");
  });

  it("should return a validation error if descriptionDetail is invalid", async () => {
    const params = {
      channelId: "UC123",
      descriptionDetail: "INVALID_OPTION",
    };
    // @ts-ignore - deliberately passing invalid enum for test
    const result = await tool.execute(params);

    expect(mockYoutubeService.getChannelRecentVideos).not.toHaveBeenCalled();
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Invalid option: expected one of");
  });

  it("should handle service errors gracefully", async () => {
    const errorMessage = "API Error";
    mockYoutubeService.getChannelRecentVideos.mockRejectedValue(
      new Error(errorMessage)
    );

    const params = { channelId: "UC123" };
    const result = await tool.execute(params);

    expect(mockYoutubeService.getChannelRecentVideos).toHaveBeenCalled();
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe(`Error: ${errorMessage}`);
  });
});
