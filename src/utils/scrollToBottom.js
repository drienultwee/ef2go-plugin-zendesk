export function scrollToBottomByElementId(elementId) {
    const commentsContainer = document.getElementById(elementId);

    commentsContainer.scrollTop = commentsContainer.scrollHeight;
}
