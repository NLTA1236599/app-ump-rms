import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';

import { MentionPicker } from './MentionPicker.js';
import {
  filterMentionCandidates,
  getActiveMentionQuery,
  insertMentionAt,
} from './mentionUtils.js';
import type { MentionCandidate } from './mentionTypes.js';

function AtSignIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm0 0v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-9 9m4.5-1.206a8.959 8.959 0 0 1-4.5 1.207"
      />
    </svg>
  );
}

type CommentMentionInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  candidates: MentionCandidate[];
  placeholder?: string;
  disabled?: boolean;
  isSaving?: boolean;
  submitLabel?: string;
  minRows?: number;
  compact?: boolean;
};

export function CommentMentionInput({
  value,
  onChange,
  onSubmit,
  candidates,
  placeholder = 'Nhập ghi chú nội bộ về đề tài hoặc gõ @ để gắn thẻ thành viên...',
  disabled = false,
  isSaving = false,
  submitLabel = 'Gửi',
  minRows = 3,
  compact = false,
}: CommentMentionInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filteredCandidates = filterMentionCandidates(candidates, mentionQuery);

  const closePicker = useCallback(() => {
    setPickerOpen(false);
    setMentionQuery('');
    setHighlightedIndex(0);
  }, []);

  const syncMentionState = useCallback(
    (text: string, cursor: number) => {
      const active = getActiveMentionQuery(text, cursor);
      if (!active) {
        closePicker();
        return;
      }
      setPickerOpen(true);
      setMentionQuery(active.query);
      setMentionStart(active.startIndex);
      setHighlightedIndex(0);
    },
    [closePicker],
  );

  const selectMention = useCallback(
    (candidate: MentionCandidate) => {
      const textarea = textareaRef.current;
      const cursor = textarea?.selectionStart ?? value.length;
      const result = insertMentionAt(value, mentionStart, cursor, candidate.username);
      onChange(result.text);
      closePicker();
      requestAnimationFrame(() => {
        if (!textareaRef.current) return;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(result.cursor, result.cursor);
      });
    },
    [closePicker, mentionStart, onChange, value],
  );

  const openMentionPicker = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || disabled) return;

    const cursor = textarea.selectionStart ?? value.length;
    const nextValue = `${value.slice(0, cursor)}@${value.slice(cursor)}`;
    onChange(nextValue);

    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      const nextCursor = cursor + 1;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(nextCursor, nextCursor);
      syncMentionState(nextValue, nextCursor);
    });
  }, [disabled, onChange, syncMentionState, value]);

  const handleChange = (text: string) => {
    onChange(text);
    const cursor = textareaRef.current?.selectionStart ?? text.length;
    syncMentionState(text, cursor);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (pickerOpen && filteredCandidates.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredCandidates.length);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlightedIndex(
          (prev) => (prev - 1 + filteredCandidates.length) % filteredCandidates.length,
        );
        return;
      }
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        selectMention(filteredCandidates[highlightedIndex]!);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        closePicker();
        return;
      }
    }

    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onSubmit();
    }
  };

  useEffect(() => {
    if (highlightedIndex >= filteredCandidates.length) {
      setHighlightedIndex(0);
    }
  }, [filteredCandidates.length, highlightedIndex]);

  return (
    <div className={compact ? 'space-y-2' : 'overflow-hidden rounded-xl border border-slate-200'}>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={(e) => syncMentionState(value, e.currentTarget.selectionStart ?? value.length)}
          onKeyUp={(e) => syncMentionState(value, e.currentTarget.selectionStart ?? value.length)}
          placeholder={placeholder}
          disabled={disabled || isSaving}
          rows={minRows}
          className={[
            'w-full resize-none p-4 text-sm focus:outline-none',
            compact ? 'rounded-lg border border-slate-200' : 'min-h-[80px]',
          ].join(' ')}
        />

        {pickerOpen ? (
          <MentionPicker
            candidates={filteredCandidates}
            highlightedIndex={highlightedIndex}
            onSelect={selectMention}
            className="bottom-full left-4 mb-2"
          />
        ) : null}
      </div>

      <div
        className={[
          'flex items-center justify-between border-slate-100 bg-slate-50 px-4 py-2',
          compact ? 'rounded-lg border' : 'border-t',
        ].join(' ')}
      >
        <div className="flex items-center gap-2 text-slate-400">
          <button
            type="button"
            onClick={openMentionPicker}
            disabled={disabled || isSaving}
            className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white hover:text-blue-600 disabled:opacity-40"
            aria-label="Gắn thẻ thành viên (@)"
            title="Gắn thẻ thành viên (@)"
          >
            <AtSignIcon className="size-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim() || disabled || isSaving}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
        >
          {isSaving ? 'Đang gửi…' : submitLabel}
        </button>
      </div>
    </div>
  );
}
