const RICH_EDITOR_ALLOWED_TAGS = new Set([
    'P',
    'BR',
    'STRONG',
    'B',
    'EM',
    'I',
    'U',
    'UL',
    'OL',
    'LI',
    'H3',
    'H4',
    'BLOCKQUOTE'
]);

class RichTextEditorManager {
    constructor() {
        this.instances = new Map();
    }

    create(textareaId, options = {}) {
        const textarea = document.getElementById(textareaId);
        if (!textarea || this.instances.has(textareaId)) {
            return this.instances.get(textareaId);
        }

        const placeholder = options.placeholder || 'Nhập nội dung...';
        textarea.style.display = 'none';

        const wrapper = document.createElement('div');
        wrapper.className = 'rich-editor';
        wrapper.innerHTML = `
            <div class="rich-editor__toolbar">
                <button type="button" data-command="bold"><strong>B</strong></button>
                <button type="button" data-command="italic"><em>I</em></button>
                <button type="button" data-command="underline"><u>U</u></button>
                <button type="button" data-command="formatBlock" data-value="H3">Tiêu đề</button>
                <button type="button" data-command="formatBlock" data-value="P">Đoạn</button>
                <button type="button" data-command="insertUnorderedList">Danh sách</button>
                <button type="button" data-command="insertOrderedList">Đánh số</button>
            </div>
            <div class="rich-editor__content" contenteditable="true" data-placeholder="${placeholder}"></div>
        `;

        textarea.parentNode.insertBefore(wrapper, textarea.nextSibling);

        const content = wrapper.querySelector('.rich-editor__content');
        const toolbar = wrapper.querySelector('.rich-editor__toolbar');

        const updateTextarea = () => {
            textarea.value = sanitizeRichTextHtml(content.innerHTML);
        };

        toolbar.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-command]');
            if (!button) {
                return;
            }

            event.preventDefault();
            const command = button.dataset.command;
            const value = button.dataset.value || null;
            document.execCommand(command, false, value);
            content.focus();
            updateTextarea();
        });

        content.addEventListener('input', updateTextarea);
        content.addEventListener('blur', () => {
            content.innerHTML = sanitizeRichTextHtml(content.innerHTML);
            updateTextarea();
        });

        const instance = {
            element: wrapper,
            content,
            textarea,
            setHTML: (html) => {
                const safeHtml = sanitizeRichTextHtml(html || '');
                content.innerHTML = safeHtml;
                textarea.value = safeHtml;
            },
            getHTML: () => textarea.value
        };

        const initialValue = textarea.value || '';
        if (initialValue) {
            instance.setHTML(initialValue);
        }

        this.instances.set(textareaId, instance);
        return instance;
    }

    get(textareaId) {
        return this.instances.get(textareaId);
    }
}

function sanitizeRichTextHtml(input) {
    const template = document.createElement('template');
    template.innerHTML = input || '';

    const visit = (node) => {
        const children = Array.from(node.childNodes);

        children.forEach((child) => {
            if (child.nodeType === Node.ELEMENT_NODE) {
                if (!RICH_EDITOR_ALLOWED_TAGS.has(child.tagName)) {
                    const fragment = document.createDocumentFragment();
                    while (child.firstChild) {
                        fragment.appendChild(child.firstChild);
                    }
                    child.replaceWith(fragment);
                    return;
                }

                Array.from(child.attributes).forEach((attribute) => {
                    child.removeAttribute(attribute.name);
                });
            }

            visit(child);
        });
    };

    visit(template.content);
    return template.innerHTML.trim();
}

const RICH_EDITOR = new RichTextEditorManager();
window.richTextSanitizeHtml = sanitizeRichTextHtml;
