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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  projectId,
  publicAnonKey,
} from "../../utils/supabase/info";
import { API_BASE_URL } from "../../utils/api-config";

interface LynaChatLog {
  id: string;
  userId: string;
  userType: "patient" | "doctor" | "guest";
  message: string;
  response: string;
  patientContext: any;
  timestamp: string;
}

export function LynaAnalytics() {
  const [logs, setLogs] = useState<LynaChatLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<
    LynaChatLog[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "patient" | "doctor" | "guest"
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
        `${API_BASE_URL}/lyna/logs`,
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

    // Filter by user type
    if (filterType !== "all") {
      filtered = filtered.filter(
        (log) => log.userType === filterType,
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

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "patient":
        return "bg-blue-100 text-blue-800";
      case "doctor":
        return "bg-green-100 text-green-800";
      case "guest":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case "patient":
        return "Patient";
      case "doctor":
        return "Arzt";
      case "guest":
        return "Gast";
      default:
        return userType;
    }
  };

  const stats = {
    total: logs.length,
    patients: logs.filter((l) => l.userType === "patient")
      .length,
    doctors: logs.filter((l) => l.userType === "doctor").length,
    guests: logs.filter((l) => l.userType === "guest").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFC000]" />
        <span className="ml-3 text-gray-600">
          Lade LYNA Analytics...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#FFC000]" />
              <span className="text-2xl">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Patienten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <span className="text-2xl">{stats.patients}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ärzte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              <span className="text-2xl">{stats.doctors}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Gäste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-2xl">{stats.guests}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>LYNA Chat-Verlauf</CardTitle>
          <CardDescription>
            Übersicht aller LYNA-Interaktionen im System
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
                  filterType === "patient"
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => setFilterType("patient")}
              >
                Patienten
              </Button>
              <Button
                variant={
                  filterType === "doctor"
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => setFilterType("doctor")}
              >
                Ärzte
              </Button>
              <Button
                variant={
                  filterType === "guest" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setFilterType("guest")}
              >
                Gäste
              </Button>
            </div>
          </div>

          {/* Logs Table */}
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Keine LYNA-Interaktionen gefunden</p>
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
                        className={getUserTypeColor(
                          log.userType,
                        )}
                      >
                        {getUserTypeLabel(log.userType)}
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
                      <Bot className="w-4 h-4 text-[#FFC000] mt-1 flex-shrink-0" />
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

                  {/* Patient Context (expanded) */}
                  {expandedLogId === log.id &&
                    log.patientContext && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">
                          Patientenkontext:
                        </p>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(
                            log.patientContext,
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