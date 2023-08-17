import {
  useCallback, useState, useRef, createRef, useEffect,
} from 'react';

export default function useAnimatedList(initialValue = []) {
  const [pendingRemoveItensIds, setPendingRemoveItensIds] = useState([]);
  const [Itens, setItens] = useState(initialValue);

  const animatedRefs = useRef(new Map());
  const animationEndListeners = useRef(new Map());

  const handleAnimationEnd = useCallback((itemId) => {
    const removeListener = animationEndListeners.current.get(itemId);
    removeListener();

    animationEndListeners.current.delete(itemId);
    animatedRefs.current.delete(itemId);

    setItens((prevState) => prevState.filter((item) => item.id !== itemId));
    setPendingRemoveItensIds(
      (prevState) => prevState.filter((id) => itemId !== id),
    );
  }, []);

  useEffect(() => {
    pendingRemoveItensIds.forEach((itemId) => {
      const animatedRef = animatedRefs.current.get(itemId);
      const animatedElement = animatedRef?.current;
      const alreadyHasLiestener = animationEndListeners.current.has(itemId);

      if (animatedElement && !alreadyHasLiestener) {
        const onAnimationEnd = () => handleAnimationEnd(itemId);
        const removeListener = () => {
          animatedElement.removeEventListener('animationend', onAnimationEnd);
        };
        animatedElement.addEventListener('animationend', onAnimationEnd);
        animationEndListeners.current.set(itemId, removeListener);
      }
    });
  }, [pendingRemoveItensIds, handleAnimationEnd]);

  useEffect(() => {
    const removeListeners = animationEndListeners.current;
    return () => {
      removeListeners.forEach((removeListener) => removeListener());
    };
  }, []);

  const handleRemoveItens = useCallback((id) => {
    setPendingRemoveItensIds(
      (prevState) => [...prevState, id],
    );
  }, []);

  const getAnimatedRef = useCallback((itemId) => {
    let animatedRef = animatedRefs.current.get(itemId);

    if (!animatedRef) {
      animatedRef = createRef();
      animatedRefs.current.set(itemId, animatedRef);
    }

    return animatedRef;
  }, []);

  const renderList = useCallback((renderItem) => (
    Itens.map((item) => {
      const isLeaving = pendingRemoveItensIds.includes(item.id);
      const animatedRef = getAnimatedRef(item.id);

      return renderItem(item, { isLeaving, animatedRef });
    })
  ), [Itens, pendingRemoveItensIds, getAnimatedRef]);

  return {
    Itens,
    setItens,
    handleRemoveItens,
    renderList,
  };
}
