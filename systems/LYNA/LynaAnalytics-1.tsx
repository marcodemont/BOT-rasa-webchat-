import React, { useState, useEffect } from "react";
import {
  Bot,
  User,
  Clock,
  MessageSquare,
  TrendingUp,
  Filter,
  Search,
  Loader2,
  Sparkles,
  Lightbulb,
  MessageCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  projectId,
  publicAnonKey,
} from "/utils/supabase/info";
import { API_BASE_URL } from "../../../utils/api-config";

interface AIChatLog {
  id: string;
  userId: string;
  aiAssistant: "lyna" | "aura" | "joi" | "quickchat";
  message: string;
  response: string;
  context: any;
  timestamp: string;
}

export function LynaAnalytics() {
  const [logs, setLogs] = useState<AIChatLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<
    AIChatLog[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "lyna" | "aura" | "joi" | "quickchat"
  >("all");
  const [expandedLogId, setExpandedLogId] = useState<
    string | null
  >(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchQuery, filterType]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/logs`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch logs");

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Error fetching LYNA logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    // Filter by AI assistant type
    if (filterType !== "all") {
      filtered = filtered.filter(
        (log) => log.aiAssistant === filterType,
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(query) ||
          log.response.toLowerCase().includes(query) ||
          log.userId.toLowerCase().includes(query),
      );
    }

    setFilteredLogs(filtered);
  };

  const getAIAssistantColor = (assistant: string) => {
    switch (assistant) {
      case "lyna":
        return "bg-yellow-100 text-yellow-800";
      case "aura":
        return "bg-blue-100 text-blue-800";
      case "joi":
        return "bg-green-100 text-green-800";
      case "quickchat":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAIAssistantLabel = (assistant: string) => {
    switch (assistant) {
      case "lyna":
        return "LYNA";
      case "aura":
        return "AURA";
      case "joi":
        return "JOI";
      case "quickchat":
        return "QuickChat";
      default:
        return assistant;
    }
  };

  const getAIAssistantIcon = (assistant: string) => {
    switch (assistant) {
      case "lyna":
        return <Sparkles className="w-5 h-5 text-yellow-600" />;
      case "aura":
        return <Bot className="w-5 h-5 text-blue-600" />;
      case "joi":
        return <Lightbulb className="w-5 h-5 text-green-600" />;
      case "quickchat":
        return <MessageCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  const stats = {
    total: logs.length,
    lyna: logs.filter((l) => l.aiAssistant === "lyna").length,
    aura: logs.filter((l) => l.aiAssistant === "aura").length,
    joi: logs.filter((l) => l.aiAssistant === "joi").length,
    quickchat: logs.filter((l) => l.aiAssistant === "quickchat").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
        <span className="ml-3 text-gray-600">
          Lade AI Analytics...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">LYNA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-600" />
              <span className="text-2xl font-bold">{stats.lyna}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">AURA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold">{stats.aura}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">JOI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold">{stats.joi}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">QuickChat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-gray-600" />
              <span className="text-2xl font-bold">{stats.quickchat}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Assistenten Chat-Verlauf</CardTitle>
          <CardDescription>
            Übersicht aller AI-Interaktionen (LYNA, AURA, JOI, QuickChat)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Suche nach Nachricht, Antwort oder Benutzer-ID..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <Button
                variant={
                  filterType === "all" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setFilterType("all")}
              >
                Alle
              </Button>
              <Button
                variant={
                  filterType === "lyna"
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => setFilterType("lyna")}
              >
                LYNA
              </Button>
              <Button
                variant={
                  filterType === "aura"
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => setFilterType("aura")}
              >
                AURA
              </Button>
              <Button
                variant={
                  filterType === "joi" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setFilterType("joi")}
              >
                JOI
              </Button>
              <Button
                variant={
                  filterType === "quickchat"
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => setFilterType("quickchat")}
              >
                QuickChat
              </Button>
            </div>
          </div>

          {/* Logs Table */}
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Keine AI-Interaktionen gefunden</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge
                        className={getAIAssistantColor(
                          log.aiAssistant,
                        )}
                      >
                        {getAIAssistantLabel(log.aiAssistant)}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        User:{" "}
                        <span className="font-mono">
                          {log.userId}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {new Date(log.timestamp).toLocaleString(
                          "de-DE",
                        )}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedLogId(
                          expandedLogId === log.id
                            ? null
                            : log.id,
                        )
                      }
                    >
                      {expandedLogId === log.id
                        ? "Weniger"
                        : "Details"}
                    </Button>
                  </div>

                  {/* Message Preview */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {expandedLogId === log.id
                            ? log.message
                            : log.message.length > 100
                              ? log.message.substring(0, 100) +
                                "..."
                              : log.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      {getAIAssistantIcon(log.aiAssistant)}
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">
                          {expandedLogId === log.id
                            ? log.response
                            : log.response.length > 100
                              ? log.response.substring(0, 100) +
                                "..."
                              : log.response}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Context (expanded) */}
                  {expandedLogId === log.id &&
                    log.context && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">
                          Kontext:
                        </p>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(
                            log.context,
                            null,
                            2,
                          )}
                        </pre>
                      </div>
                    )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}