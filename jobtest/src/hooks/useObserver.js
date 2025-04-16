import { useEffect, useRef } from "react";

function useObserver(ref, dispatch) {
    const observer = useRef()

    useEffect(()=>{
        if(!ref.current){return}
        var callback = function (entries) {
            if (entries[0].isIntersecting) {
                dispatch('next')
            }
        };
        observer.current = new IntersectionObserver(callback);
        observer.current.observe(ref.current)
        return ()=>{observer.current?.disconnect()}
    }, [])
}

export default useObserver