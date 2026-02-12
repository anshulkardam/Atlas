import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { ContextSnippet } from "@/types/entities";
import { useContextSnippets } from "@/api/entities";

interface ContextSnippetsDisplayProps {
  personId: string;
}

const getSnippetTypeLabel = (type: ContextSnippet["snippetType"]) => {
  switch (type) {
    case "COMPANY_VALUE_PROP":
      return "Company Value Proposition";
    case "PRODUCT_NAMES":
      return "Products/Services";
    case "PRICING_MODEL":
      return "Pricing Model";
    case "KEY_COMPETITORS":
      return "Key Competitors";
    case "RECENT_NEWS":
      return "Recent News";
    default:
      return type;
  }
};

const getConfidenceColor = (score: number) => {
  if (score >= 0.8) return "bg-green-100 text-green-800";
  if (score >= 0.6) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

const formatSourceUrls = (urls: string[]) => {
  if (!urls || urls.length === 0) return [];
  return urls.slice(0, 3); // Show max 3 sources
};

export function ContextSnippetsDisplay({
  personId,
}: ContextSnippetsDisplayProps) {
  const { data: snippets, isLoading, error } = useContextSnippets(personId);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Context Snippets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600">Error loading context snippets</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Context Snippets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Separator />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!snippets || snippets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Context Snippets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">
              No context snippets available. Enrich this contact to see research
              results.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group snippets by type
  const groupedSnippets = snippets.reduce(
    (acc, snippet) => {
      if (!acc[snippet.snippetType]) {
        acc[snippet.snippetType] = [];
      }
      acc[snippet.snippetType].push(snippet);
      return acc;
    },
    {} as Record<string, ContextSnippet[]>,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Context Snippets</CardTitle>
        <p className="text-sm text-gray-600">
          Research results and extracted information from enrichment
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full">
          <div className="space-y-6">
            {Object.entries(groupedSnippets).map(
              ([snippetType, typeSnippets]) => (
                <div key={snippetType} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base">
                      {getSnippetTypeLabel(
                        snippetType as ContextSnippet["snippetType"],
                      )}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {typeSnippets.length}
                    </Badge>
                  </div>

                  <div className="space-y-3 pl-4">
                    {typeSnippets.map((snippet, index) => (
                      <div
                        key={snippet.id}
                        className="space-y-2 border-l-2 border-gray-200 pl-4"
                      >
                        {/* Snippet Content */}
                        <div className="space-y-1">
                          {snippet.payload &&
                            typeof snippet.payload === "string" && (
                              <p className="text-sm">{snippet.payload}</p>
                            )}
                          {snippet.payload &&
                            typeof snippet.payload === "object" && (
                              <div className="text-sm space-y-1">
                                {Array.isArray(snippet.payload)
                                  ? snippet.payload.map((item, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center gap-2"
                                      >
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        <span>{item}</span>
                                      </div>
                                    ))
                                  : Object.entries(snippet.payload).map(
                                      ([key, value]) => (
                                        <div key={key} className="space-y-1">
                                          <span className="font-medium text-xs uppercase text-gray-500">
                                            {key.replace(/_/g, " ")}:
                                          </span>
                                          <div>
                                            {typeof value === "string"
                                              ? value
                                              : JSON.stringify(value)}
                                          </div>
                                        </div>
                                      ),
                                    )}
                              </div>
                            )}
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <Badge
                            className={getConfidenceColor(
                              snippet.confidenceScore,
                            )}
                          >
                            {Math.round(snippet.confidenceScore * 100)}%
                            confidence
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(snippet.cacheHitRatio * 100)}% cache hit
                          </Badge>
                          <span>
                            {new Date(snippet.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Source URLs */}
                        {formatSourceUrls(snippet.sourceUrls).length > 0 && (
                          <div className="space-y-1">
                            <span className="text-xs font-medium text-gray-700">
                              Sources:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {formatSourceUrls(snippet.sourceUrls).map(
                                (url, i) => (
                                  <a
                                    key={i}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 underline truncate max-w-[200px]"
                                    title={url}
                                  >
                                    {
                                      url
                                        .replace(/^https?:\/\//, "")
                                        .split("/")[0]
                                    }
                                  </a>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                        {index < typeSnippets.length - 1 && (
                          <Separator className="mt-3" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
