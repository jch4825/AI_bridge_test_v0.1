export function friendlyApiError(e: any, opts?: { markdown?: boolean }): string {
  const raw = typeof e === 'string' ? e : e?.message ?? '';
  const md = opts?.markdown ?? false;

  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('quota')) {
    return md
      ? '⏳ **API 무료 한도를 초과했습니다.**\n\n- 무료 티어는 분당/일일 요청 수 제한이 있습니다.\n- 잠시 후(보통 1분 이내) 다시 시도해 주세요.\n- 오늘 한도를 모두 사용한 경우 내일 자동으로 초기화됩니다.'
      : '⏳ API 무료 한도를 초과했습니다. 잠시 후(보통 1분 이내) 다시 시도하거나, 오늘 한도를 모두 사용한 경우 내일 다시 시도해 주세요.';
  }
  if (
    raw.includes('400') ||
    raw.includes('401') ||
    raw.includes('403') ||
    raw.includes('API key') ||
    raw.includes('API_KEY') ||
    raw.includes('invalid') ||
    raw.includes('INVALID_ARGUMENT') ||
    raw.includes('PERMISSION_DENIED') ||
    raw.includes('UNAUTHENTICATED')
  ) {
    return md
      ? '🔑 **API 키가 올바르지 않거나 만료되었습니다.**\n\n- 상단의 "API 키 등록" 버튼을 눌러 키를 다시 확인해 주세요.\n- Google AI Studio에서 새 키를 발급받을 수 있습니다.'
      : '🔑 API 키가 올바르지 않거나 만료되었습니다. API 키를 다시 확인하거나 Google AI Studio에서 새 키를 발급받아 주세요.';
  }
  if (raw.includes('network') || raw.includes('fetch') || raw.includes('Failed') || raw.includes('ECONN')) {
    return md
      ? '📡 **네트워크 연결을 확인해 주세요.**\n\n인터넷 연결 상태를 확인한 뒤 다시 시도해 주세요.'
      : '📡 네트워크 연결을 확인해 주세요. 인터넷이 연결되었는지 확인한 뒤 다시 시도해 주세요.';
  }
  return md
    ? '⚠️ **알 수 없는 오류가 발생했습니다.**\n\n잠시 후 다시 시도해 주세요.'
    : '⚠️ 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
}
