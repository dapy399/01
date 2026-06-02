import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SearchService {
  private readonly bingApiKey: string;
  private readonly bingEndpoint = 'https://api.bing.microsoft.com/v7.0/search';

  constructor(private configService: ConfigService) {
    this.bingApiKey = this.configService.get<string>('BING_SEARCH_API_KEY') || '';
  }

  /**
   * 调用必应搜索API
   * @param query 用户问题
   * @returns 搜索结果的文本摘要
   */
  async search(query: string): Promise<string> {
    if (!this.bingApiKey) {
      return '联网搜索未配置API密钥，将基于已有知识回答。';
    }

    try {
      const response = await axios.get(this.bingEndpoint, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.bingApiKey,
        },
        params: {
          q: query,
          count: 5,
          mkt: 'zh-CN',
          safesearch: 'Moderate',
        },
        timeout: 8000,
      });

      const webPages = response.data.webPages?.value || [];

      if (webPages.length === 0) {
        return '未搜索到相关结果。';
      }

      let searchResultText = '以下是联网搜索到的相关信息：\n\n';

      webPages.forEach((item: any, index: number) => {
        searchResultText += `[${index + 1}] ${item.name}\n`;
        searchResultText += `来源：${item.url}\n`;
        searchResultText += `摘要：${item.snippet}\n\n`;
      });

      return searchResultText;
    } catch (error: any) {
      console.error('必应搜索出错：', error.message);
      return '联网搜索暂时不可用，将基于已有知识回答。';
    }
  }

  /**
   * Tavily搜索（备选方案，专为AI优化）
   */
  async searchTavily(query: string): Promise<string> {
    const tavilyApiKey = this.configService.get<string>('TAVILY_API_KEY');

    console.log('[Tavily搜索] API Key是否配置：', tavilyApiKey ? '已配置' : '未配置');
    console.log('[Tavily搜索] 查询内容：', query);

    if (!tavilyApiKey) {
      console.log('[Tavily搜索] 错误：API密钥未配置');
      return 'Tavily搜索未配置API密钥。';
    }

    try {
      const response = await axios.post(
        'https://api.tavily.com/search',
        {
          api_key: tavilyApiKey,
          query: query,
          search_depth: 'basic',
          include_answer: true,
          max_results: 5,
        },
        { timeout: 8000 },
      );

      console.log('[Tavily搜索] 响应状态：', response.status);
      console.log('[Tavily搜索] 结果数量：', response.data.results?.length || 0);

      const results = response.data.results || [];
      const answer = response.data.answer || '';

      if (results.length === 0 && !answer) {
        console.log('[Tavily搜索] 未返回任何结果');
        return '未搜索到相关结果。';
      }

      let searchResultText = '';

      if (answer) {
        searchResultText += `搜索总结：${answer}\n\n`;
      }

      searchResultText += '详细搜索结果：\n';
      results.forEach((item: any, index: number) => {
        searchResultText += `[${index + 1}] ${item.title}\n`;
        searchResultText += `来源：${item.url}\n`;
        searchResultText += `内容：${item.content}\n\n`;
      });

      console.log('[Tavily搜索] 返回文本长度：', searchResultText.length);
      return searchResultText;
    } catch (error: any) {
      console.error('[Tavily搜索] 请求出错：', error.message);
      if (error.response) {
        console.error('[Tavily搜索] 错误状态码：', error.response.status);
        console.error('[Tavily搜索] 错误详情：', JSON.stringify(error.response.data));
      }
      return `Tavily搜索出错：${error.message}`;
    }
  }
}
