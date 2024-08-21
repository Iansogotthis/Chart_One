import * as d3 from './d3.js';
import FormModal from './components/FormModal.js';
import * as React from 'react';

document.addEventListener('DOMContentLoaded', () => {
            const svg = d3.select("#chart");
            const { width, height } = calculateDimensions();
            const { centerX, centerY, centerSquareSize, smallSquareSize, tinySquareSize } = calculateSizes(width, height);

            svg.attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "xMidYMid meet");

            const modal = document.getElementById("myModal");
            let currentSquareData = null;
            let currentSquareClass = '';

            const squareConfig = {
                1: { className: 'branch', color: 'lightgray' },
                2: { className: 'leaf', color: 'lightgreen' },
                3: { className: 'fruit', color: 'lightcoral' }
            };

            function modalOperation(action, mode = '', squareData = null) {
                modal.style.display = action === 'open' ? "flex" : "none";
                renderFormModal(action === 'open', mode, squareData);
            }

            function createSquareData(className) {
                return {
                    title: `${className} Square`,
                    plane: 'Default Plane',
                    purpose: 'Default Purpose',
                    delineator: 'Default Delineator',
                    notations: 'Default Notations',
                    details: 'Default Details',
                    extraData: 'Default Extra Data',
                    name: className,
                    size: 'Default Size',
                    color: 'Default Color',
                    type: className,
                    parent_id: 'Default Parent ID'
                };
            }

            const modalActions = {
                close: () => modalOperation('close'),
                'view-scale': () => modalOperation('open', 'view-scale'),
                'view-scope': () => modalOperation('open', 'view-scope'),
                include: () => {
                    const squareData = createSquareData(currentSquareClass);
                    modalOperation('open', 'include', squareData);
                },
                cancel: () => modalOperation('close')
            };

            Object.entries(modalActions).forEach(([action, handler]) => {
                const element = document.getElementById(action) || document.getElementsByClassName(action)[0];
                if (element) element.onclick = handler;
            });

            window.onclick = (event) => {
                if (event.target === modal) modalOperation('close');
            };

            function renderFormModal(isOpen, mode = '', squareData = null) {
                const modalRoot = document.getElementById('modal-root');
                if (modalRoot) {
                    modalRoot.innerHTML = `
                <div class="modal" style="display: ${isOpen ? 'flex' : 'none'}; justify-content: center; align-items: center;">
                    <div class="modal-content">
                        <span class="close" onclick="modalOperation('close')">&times;</span>
                        ${mode === 'include' ? renderFormPage(squareData) : renderExcludeForm()}
                    </div>
                </div>
            `;
                } else {
                    console.error('Element with id "modal-root" not found');
                }
            }

            function renderFormPage(squareData) {
                const fields = ['title', 'plane', 'purpose', 'delineator', 'name', 'size', 'color', 'type', 'parent_id'];
                const textareas = ['notations', 'details', 'extraData'];

                return `
            <h2>Include Data</h2>
            <form onsubmit="handleFormSubmit(event)">
                ${fields.map(field => `
                    <label for="${field}">${field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                    <input type="${field === 'color' ? 'color' : 'text'}" id="${field}" name="${field}" value="${squareData[field]}" required><br><br>
                `).join('')}
                ${textareas.map(field => `
                    <label for="${field}">${field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                    <textarea id="${field}" name="${field}">${squareData[field]}</textarea><br><br>
                `).join('')}
                <button type="submit">Submit</button>
            </form>
        `;
    }

    function renderExcludeForm() {
        return `
            <h2>Exclude Data</h2>
            <form>
                <label for="data">Data:</label>
                <input type="text" id="data" name="data" required><br><br>
                <button type="submit">Submit</button>
            </form>
        `;
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const updatedSquareData = Object.fromEntries(formData);
        console.log('Form submitted:', updatedSquareData);
        modalOperation('close');
    }

    function drawSquare(x, y, size, color, className, depth, parentText) {
        svg.append("rect")
            .attr("x", x - size / 2)
            .attr("y", y - size / 2)
            .attr("width", size)
            .attr("height", size)
            .attr("class", `square ${className}`)
            .attr("fill", color)
            .on("click", () => onSquareClick(className));

        svg.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .attr("font-size", size / 5)
            .attr("pointer-events", "none")
            .text(className);
    }

    function onSquareClick(className) {
        currentSquareClass = className;
        currentSquareData = createSquareData(className);
        modalOperation('open', 'include', currentSquareData);
    }

    function initializeVisualization(data = {}) {
        svg.selectAll("*").remove();
        drawSquare(centerX, centerY, centerSquareSize, "lightblue", "root", 1, "Center");
        const corners = [
            [centerX - centerSquareSize / 2, centerY - centerSquareSize / 2],
            [centerX + centerSquareSize / 2, centerY - centerSquareSize / 2],
            [centerX - centerSquareSize / 2, centerY + centerSquareSize / 2],
            [centerX + centerSquareSize / 2, centerY + centerSquareSize / 2],
        ];
        drawSquares(corners, smallSquareSize, 1, "root", "Root", data);
    }

    function drawSquares(corners, size, depth, className, parentText, data) {
        if (depth > 3) return;

        corners.forEach(([x, y], index) => {
            const config = squareConfig[depth] || {};
            const squareData = data[config.className] || {};

            drawSquare(
                x, y, size,
                squareData.color || config.color || "",
                config.className || "",
                depth,
                parentText
            );

            if (size > tinySquareSize) {
                const nextSize = size / 2;
                const nextCorners = [
                    [x - size / 2, y - size / 2],
                    [x + size / 2, y - size / 2],
                    [x - size / 2, y + size / 2],
                    [x + size / 2, y + size / 2],
                ];

                requestAnimationFrame(() => {
                    drawSquares(
                        nextCorners,
                        nextSize,
                        depth + 1,
                        config.className || "",
                        `${parentText}_${index + 1}`,
                        squareData.children || {}
                    );
                });
            }
        });
    }

    function calculateDimensions() {
        return {
            width: window.innerWidth * 0.9,
            height: window.innerHeight * 0.9
        };
    }

    function calculateSizes(width, height) {
        const centerSquareSize = Math.min(width, height) / 2;
        return {
            centerX: width / 2,
            centerY: height / 2,
            centerSquareSize,
            smallSquareSize: centerSquareSize / 2,
            tinySquareSize: centerSquareSize / 8
        };
    }

    initializeVisualization();
});