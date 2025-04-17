// past this on chrome console here https://neal.fun/infinite-craft/

function simulateDragAndDrop(
  element,
  startX,
  startY,
  targetX,
  targetY,
  steps = 10
) {
  return new Promise((resolve) => {
    function triggerMouseEvent(target, eventType, clientX, clientY) {
      const event = new MouseEvent(eventType, {
        bubbles: true,
        cancelable: true,
        clientX,
        clientY,
        view: window,
      });
      target.dispatchEvent(event);
    }

    console.log(
      `Start: (${startX}, ${startY}), Target: (${targetX}, ${targetY})`
    );
    triggerMouseEvent(element, "mousedown", startX, startY);

    let currentX = startX;
    let currentY = startY;
    const deltaX = (targetX - startX) / steps;
    const deltaY = (targetY - startY) / steps;

    function moveMouse() {
      currentX += deltaX;
      currentY += deltaY;
      triggerMouseEvent(document, "mousemove", currentX, currentY);

      const reachedX = deltaX > 0 ? currentX >= targetX : currentX <= targetX;
      const reachedY = deltaY > 0 ? currentY >= targetY : currentY <= targetY;

      if (reachedX && reachedY) {
        triggerMouseEvent(document, "mouseup", targetX, targetY);
        console.log("Drag-and-drop completed.");
        element.style.position = "absolute";
        element.style.left = `${targetX}px`;
        element.style.top = `${targetY}px`;
        resolve();
      } else {
        requestAnimationFrame(moveMouse);
      }
    }

    requestAnimationFrame(moveMouse);
  });
}

async function test() {
  const stored = JSON.parse(localStorage.getItem("processedPairs")) || [];
  const processedPairs = new Set(stored);

  function saveProcessedPairs() {
    localStorage.setItem(
      "processedPairs",
      JSON.stringify(Array.from(processedPairs))
    );
  }

  async function clickClearButton() {
    const clearBtn = document.getElementsByClassName("clear")[0];
    if (clearBtn) {
      clearBtn.click();
      console.log("Clear button clicked.");
      -(await new Promise((resolve) => setTimeout(resolve, 250)));
      +(await new Promise((resolve) => setTimeout(resolve, 250)));
      const dangerBtn = document.getElementsByClassName("action-danger")[0];
      if (dangerBtn) dangerBtn.click();
    } else {
      console.error("Clear button not found.");
    }
  }

  async function processCombination(firstItem, secondItem, targetX, targetY) {
    const firstRect = firstItem.getBoundingClientRect();
    const secondRect = secondItem.getBoundingClientRect();
    const firstStartX = firstRect.x + firstRect.width / 2;
    const firstStartY = firstRect.y + firstRect.height / 2;
    const secondStartX = secondRect.x + secondRect.width / 2;
    const secondStartY = secondRect.y + secondRect.height / 2;

    await simulateDragAndDrop(
      firstItem,
      firstStartX,
      firstStartY,
      targetX,
      targetY
    );
    await simulateDragAndDrop(
      secondItem,
      secondStartX,
      secondStartY,
      targetX,
      targetY
    );
    await clickClearButton();
  }

  async function processItems(itemsRow) {
    const items = itemsRow.getElementsByClassName("item");
    for (let i = 0; i < items.length; i++) {
      for (let j = 0; j < items.length; j++) {
        if (i !== j) {
          const pairKey = `${i}-${j}`;
          if (!processedPairs.has(pairKey)) {
            processedPairs.add(pairKey);
            saveProcessedPairs();
            await processCombination(items[i], items[j], 500, 100);
          }
        }
      }
    }
  }

  const itemsRows = document.getElementsByClassName("items-inner");
  for (const row of itemsRows) {
    await processItems(row);
  }
}

test();
