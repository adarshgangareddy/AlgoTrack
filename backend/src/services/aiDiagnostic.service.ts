// backend/src/services/aiDiagnostic.service.ts
// Secure Backend-Only AI Provider Diagnostics Logger

export type KeySource = 'user_key' | 'application_key' | 'no_key';
export type DiagnosticStatus = 'success' | 'failed';

export interface AiDiagnosticEntry {
  requestId: string;
  userId: string;
  provider: 'Groq';
  keySource: KeySource;
  model: string;
  status: DiagnosticStatus;
  timestamp: string;
  errorDetails?: string;
}

export class AiDiagnosticService {
  private static history: AiDiagnosticEntry[] = [];
  private static readonly MAX_HISTORY = 50;

  /**
   * Logs structured diagnostic output to backend terminal for developer verification.
   * STRICT SECURITY: Never logs the actual API key, encrypted token, or auth headers.
   */
  static log(entry: AiDiagnosticEntry): void {
    console.log('\n================================================================================');
    console.log('[AI Provider Diagnostic]');
    console.log(`- Request ID:            ${entry.requestId}`);
    console.log(`- Authenticated User ID: ${entry.userId || 'anonymous'}`);
    console.log(`- Provider:              ${entry.provider}`);
    console.log(`- Key Source:            ${entry.keySource}`);
    console.log(`- Model:                 ${entry.model}`);
    console.log(`- Request Status:        ${entry.status}`);
    if (entry.errorDetails) {
      console.log(`- Error Details:         ${entry.errorDetails}`);
    }
    console.log(`- Timestamp:             ${entry.timestamp}`);
    console.log('================================================================================\n');

    // Store in circular buffer for developer diagnostic endpoint
    this.history.unshift(entry);
    if (this.history.length > this.MAX_HISTORY) {
      this.history.pop();
    }
  }

  /**
   * Retrieves recent diagnostics filtered by the authenticated user's ID
   */
  static getRecentDiagnostics(userId: string): AiDiagnosticEntry[] {
    return this.history
      .filter((h) => h.userId === userId || !userId)
      .slice(0, 20);
  }
}

