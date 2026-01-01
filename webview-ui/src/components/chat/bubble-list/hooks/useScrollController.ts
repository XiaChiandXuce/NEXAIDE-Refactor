import type { GetRef } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { Bubble } from '@ant-design/x';
import type { Message } from '../../../../hooks/useExtension';

export const useScrollController = (
    listRef: React.RefObject<GetRef<typeof Bubble.List> | null>,
    messages: Message[]
) => {
    const [showScrollDown, setShowScrollDown] = useState(false);
    const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

    // Threshold for showing the button (visual cue)
    const SHOW_BUTTON_THRESHOLD = 50;

    // Threshold for enabling auto-scroll (stickiness)
    // Must be very small to allow immediate escape from bottom
    const STICKY_THRESHOLD = 5;

    /**
     * Handle Scroll Events
     * logic: If user scrolls up significantly, show button and disable auto-scroll.
     */
    const onScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        const { scrollTop, scrollHeight, clientHeight } = target;

        // Calculate distance from bottom
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

        // 1. Control Button Visibility
        if (distanceFromBottom > SHOW_BUTTON_THRESHOLD) {
            setShowScrollDown(true);
        } else {
            setShowScrollDown(false);
        }

        // 2. Control Auto-Scroll (Stickiness)
        // Only enable stickiness if we are extremely close to the bottom.
        // This prevents "fighting" the user when they try to scroll up.
        if (distanceFromBottom <= STICKY_THRESHOLD) {
            setIsAutoScrollEnabled(true);
        } else {
            setIsAutoScrollEnabled(false);
        }
    }, []);

    /**
     * Scroll To Bottom Action
     */
    const scrollToBottom = useCallback((smooth = true) => {
        if (!listRef.current) return;

        listRef.current.scrollTo({
            top: 'bottom',
            behavior: smooth ? 'smooth' : 'instant',
        });

        // Force reset state
        setShowScrollDown(false);
        setIsAutoScrollEnabled(true);
    }, [listRef]);

    /**
     * Effect: Auto-scroll on new messages
     * Only if auto-scroll is enabled (User hasn't scrolled up)
     */
    useEffect(() => {
        if (isAutoScrollEnabled && messages.length > 0) {
            // Use 'instant' for streaming stability, or 'smooth' if prefered.
            // For streaming text, 'instant' often prevents jitter.
            // However, AntD X Bubble.List has built-in autoScroll prop.
            // We might want to rely on that for the heavy lifting, 
            // but our hook provides the manual override capability.

            // If we are strictly controlling it via hook:
            scrollToBottom(false);
        }
    }, [messages.length, messages[messages.length - 1]?.content, isAutoScrollEnabled, scrollToBottom]);

    return {
        showScrollDown,
        onScroll,
        scrollToBottom,
        isAutoScrollEnabled
    };
};
