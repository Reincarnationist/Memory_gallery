import * as React from 'react';
import '../../../static/css/mult_inline_edit.css'

export default function MultilineEdit ({ value, setValue }) {
	const [editingValue, setEditingValue] = React.useState(value);

	const onChange = (event) => setEditingValue(event.target.value);

	// either enter or esc will exit the textfield and save the input
	const onKeyDown = (event) => {
	if (event.key === "Enter" || event.key === "Escape") {
		event.target.blur();
	}
	};

	// Empty textfield is not allowed
	const onBlur = (event) => {
	if (event.target.value.trim() === "") {
		setEditingValue(value);
	} else {
		setValue(event.target.value);
	}
	};

	const onInput = (target) => {
	if (target.scrollHeight > 33) {
		target.style.height = "5px";
		target.style.height = target.scrollHeight - 16 + "px";
	}
	};

	const textareaRef = React.useRef();

	React.useEffect(() => {
	onInput(textareaRef.current);
	}, [onInput, textareaRef]);

	return (
	<textarea
		rows={1}
		aria-label="Field name"
		value={editingValue}
		onBlur={onBlur}
		onChange={onChange}
		onKeyDown={onKeyDown}
		onInput={(event) => onInput(event.target)}
		ref={textareaRef}
	/>
	);
};