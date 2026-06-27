import { Injectable, Logger } from "@nestjs/common";
import { ServiceImportStrategy } from "./strategies/service-import.strategy";
import { StaffImportStrategy } from "./strategies/staff-import.strategy";
import { CustomerImportStrategy } from "./strategies/customer-import.strategy";
import { ImportStrategy } from "./interfaces/import-strategy.interface";

@Injectable()
export class ImportEngineService {
  private readonly logger = new Logger(ImportEngineService.name);
  private readonly strategies = new Map<string, ImportStrategy>();

  constructor(
    private readonly serviceImportStrategy: ServiceImportStrategy,
    private readonly staffImportStrategy: StaffImportStrategy,
    private readonly customerImportStrategy: CustomerImportStrategy
  ) {
    // Register available strategies
    this.strategies.set("service", serviceImportStrategy);
    this.strategies.set("staff", staffImportStrategy);
    this.strategies.set("customer", customerImportStrategy);
  }

  /**
   * Retrieves the strategy associated with a specific entity.
   */
  getStrategy(entity: string): ImportStrategy | null {
    return this.strategies.get(entity.toLowerCase().trim()) || null;
  }

  /**
   * Analyzes file headers against target database fields using DeepSeek.
   * Falls back to string-similarity matching if DeepSeek is unconfigured or fails.
   */
  async analyzeMapping(
    fileHeaders: string[],
    sampleRows: any[][],
    targetSchema: Array<{ field: string; label: string; type: string; required: boolean; description?: string }>
  ): Promise<{ mappings: Array<{ fileHeader: string; targetField: string; confidence: number }>; unmapped: string[] }> {
    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_BASE_URL || "https://api.deepseek.com/v1";
    const model = process.env.AI_MODEL || "deepseek-chat";
    console.log("analyzeMapping");
    if (!apiKey) {
      this.logger.warn("AI_API_KEY is not defined in environment. Falling back to local semantic matching.");
      return this.fallbackMatching(fileHeaders, targetSchema);
    }

    try {
      const prompt = `
You are an expert data migration assistant. 
Your task is to map the user's Excel/CSV file columns (provided in \`fileHeaders\`) to the target system database fields (provided in \`targetSchema\`).

We have also provided up to 3 sample rows (\`sampleRows\`) from the file to help you understand the semantic meaning of the values under each header.

FILE COLUMNS (fileHeaders):
${JSON.stringify(fileHeaders)}

SAMPLE ROWS (sampleRows):
${JSON.stringify(sampleRows)}

TARGET SYSTEM SCHEMA (targetSchema):
${JSON.stringify(targetSchema)}

Instructions:
1. Examine column names and their sample data. Match them to the closest target fields.
2. Return a strict JSON response containing:
   - "mappings": array of objects with { "fileHeader": string, "targetField": string, "confidence": number (between 0.0 and 1.0) }
   - "unmapped": array of targetField keys that could not be mapped.
3. Be smart about abbreviations, synonyms, or Vietnamese accents. For example: "Tên dịch vụ", "Tên", "Dịch vụ" should map to "name". "Giá bán", "Đơn giá", "Giá" should map to "price". "Giảm giá", "KM", "Mức giảm" should map to "discountAmount". "Thời lượng", "Số phút", "Thời gian" should map to "duration".
4. Do NOT output any conversational text or markdown code blocks (e.g., \`\`\`json). Just return the raw JSON object.
`;

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: "You are a helpful AI assistant that only outputs raw JSON. Do not include markdown code block formatting." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const resData = await response.json();
      const rawText = resData.choices?.[0]?.message?.content?.trim() || "";
      
      // Parse JSON safely
      const cleanJson = rawText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleanJson);
      
      if (parsed && Array.isArray(parsed.mappings)) {
        return parsed;
      }

      throw new Error("Invalid output format returned by AI provider");
    } catch (err: any) {
      this.logger.error(`AI API mapping failed: ${err.message || err}. Using local fallback.`, err.stack);
      return this.fallbackMatching(fileHeaders, targetSchema);
    }
  }

  /**
   * Safe fallback mapping based on string similarity.
   */
  private fallbackMatching(
    fileHeaders: string[],
    targetSchema: Array<{ field: string; label: string; type: string; required: boolean }>
  ): { mappings: Array<{ fileHeader: string; targetField: string; confidence: number }>; unmapped: string[] } {
    const mappings: Array<{ fileHeader: string; targetField: string; confidence: number }> = [];
    const mappedTargets = new Set<string>();
    console.log("fallbackMatching");
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "").trim();

    // Map common synonyms (Vietnamese)
    const synonyms: Record<string, string[]> = {
      name: ["ten", "hoten", "tennhanvien", "tennv", "name", "fullname", "tendichvu", "tensanpham", "tenhanghoa", "dichvu", "sanpham", "title"],
      price: ["gia", "giaban", "dongia", "giagoc", "price", "rate"],
      discountPrice: ["giakm", "giakhuyenmai", "giadasautrung", "giadasaukhuyenmai", "promo", "promoprice"],
      discountAmount: ["giamgia", "mucgiam", "tiengiam", "chietkhau", "discount", "deduction"],
      duration: ["thoiluong", "duration", "sophut", "phut", "thoigian", "mins", "minutes"],
      categoryName: ["nhom", "phankhoa", "phanloai", "nhomdichvu", "category", "group"],
      email: ["email", "thudientu", "thudientu", "mail"],
      phone: ["sodt", "sodienthoai", "phone", "dienthoai", "tel", "contact"],
      sex: ["gioitinh", "sex", "gender", "phai"],
      baseSalary: ["luongcoban", "luong", "salary", "basesalary", "mucluong", "tienluong"],
      roleName: ["chucvu", "role", "rolename", "vitri", "chucdanh", "nhomquyen"]
    };

    for (const header of fileHeaders) {
      const cleanedHeader = clean(header);
      let bestMatchField: string | null = null;
      let highestConfidence = 0;

      for (const target of targetSchema) {
        const fieldKey = target.field;
        const targetLabelClean = clean(target.label || "");
        const targetFieldClean = clean(fieldKey);

        // Exact or direct matches
        if (cleanedHeader === targetFieldClean || cleanedHeader === targetLabelClean) {
          bestMatchField = fieldKey;
          highestConfidence = 0.95;
          break;
        }

        // Synonym match
        const list = synonyms[fieldKey] || [];
        if (list.includes(cleanedHeader)) {
          bestMatchField = fieldKey;
          highestConfidence = 0.90;
          break;
        }

        // Substring matching
        if (cleanedHeader.includes(targetFieldClean) || targetFieldClean.includes(cleanedHeader) ||
            cleanedHeader.includes(targetLabelClean) || targetLabelClean.includes(cleanedHeader)) {
          bestMatchField = fieldKey;
          highestConfidence = 0.70;
        }
      }

      if (bestMatchField && !mappedTargets.has(bestMatchField)) {
        mappings.push({
          fileHeader: header,
          targetField: bestMatchField,
          confidence: highestConfidence
        });
        mappedTargets.add(bestMatchField);
      }
    }

    const unmapped = targetSchema
      .map(t => t.field)
      .filter(field => !mappedTargets.has(field));

    return {
      mappings,
      unmapped
    };
  }
}
