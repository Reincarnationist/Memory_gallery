// The basic idea is from 'react-simple-image-viewer'
import * as React from 'react';
import '../../../static/css/imageviewer.css'



export default function ImageViewer(props) {
	const [currentIndex, setCurrentIndex] = React.useState(props.currentIndex ?? 0);

	const changeCurrentView = (direction) => {
		let nextIndex = (currentIndex + direction) % props.src.length;
      	if (nextIndex < 0) nextIndex = props.src.length - 1;
     	setCurrentIndex(nextIndex);
	}

	// click outside to close
	const handleClick = (e) => {
		if (!e.target || !props.closeOnClickOutside) {
			return ;
		}
		const checkId = e.target.id === 'ImageViewer';
      	const checkClass = e.target.classList.contains('slide');

		if (checkId || checkClass) {
			e.stopPropagation();
			props.onClose();
		}
	}

	const handleKeyDown = (e) => {
		if (e.key === "Escape") {
			props.onClose();
		}

		switch (e.key) {
			case 'ArrowLeft':
				changeCurrentView(-1)
				break;
			case 'ArrowRight':
				changeCurrentView(1)
				break;
			default:
				null
		}
	}

	const handleWheel = (e) => {
		e.wheelDeltaY > 0 ? changeCurrentView(-1): changeCurrentView(1)
	}


	React.useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
	
		if (!props.disableScroll) {
		  	document.addEventListener("wheel", handleWheel);
		}
		
		//clean up
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		
			if (!props.disableScroll) {
				document.removeEventListener("wheel", handleWheel);
			}
		};
	}, [handleKeyDown, handleWheel]);


	return (
		<div
			id='ImageViewer'
			className='wrapper'
			onKeyDown={handleKeyDown}
			onClick={handleClick}
		>	
			<span
			className='exif_info'
			>
			{ 'test' }
			</span>

			<span
			className='close'
			onClick={() => props.onClose()}
			>
			{ "×" }
			</span>

			{props.src.length > 1 && (
			<span
				className={"navigation prev"}
				onClick={() => changeCurrentView(-1)}
			>
				{ "❮" }
			</span>
			)}

			{props.src.length > 1 && (
			<span
				className="navigation next"
				onClick={() => changeCurrentView(1)}
			>
				{ "❯" }
			</span>
			)}

			<div
			className='content'
			onClick={handleClick}
			>
			<div className='slide'>
				<img className='image' src={props.src[currentIndex]} alt="" />
			</div>
			</div>
		</div>
		);

}