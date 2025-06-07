import * as React from "react";
import { createRoot } from 'react-dom/client';

import { AdvancedSkreativKipOptionsComponent } from "../components/options/AdvancedSkreativKipOptionsComponent";

class AdvancedSkreativKipOptions {
    constructor(element: Element) {
        const root = createRoot(element);
        root.render(
            <AdvancedSkreativKipOptionsComponent />
        );
    }
}

export default AdvancedSkreativKipOptions;