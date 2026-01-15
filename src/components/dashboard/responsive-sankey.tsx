"use client";

import React, { useRef, useEffect, useState } from 'react';
import { SankeyDiagram, type SankeyData } from './sankey-diagram';

type ResponsiveSankeyProps = {
    data: SankeyData;
    height: number;
};

export const ResponsiveSankey: React.FC<ResponsiveSankeyProps> = ({ data, height }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setWidth(containerRef.current.offsetWidth);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    return (
        <div ref={containerRef} style={{ width: '100%', height: `${height}px` }}>
            {width > 0 && <SankeyDiagram data={data} width={width} height={height} />}
        </div>
    );
};
