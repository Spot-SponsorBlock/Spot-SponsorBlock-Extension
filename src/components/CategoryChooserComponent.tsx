import * as React from "react";

import * as CompileConfig from "../../config.json";
import CategorySkreativKipOptionsComponent from "./CategorySkreativKipOptionsComponent";

export interface CategoryChooserProps { 

}

export interface CategoryChooserState {

}

class CategoryChooserComponent extends React.Component<CategoryChooserProps, CategoryChooserState> {

    constructor(props: CategoryChooserProps) {
        super(props);

        // Setup state
        this.state = {
            
        }
    }

    render(): React.ReactElement {
        return (
            <table id="categoryChooserTable"
                className="categoryChooserTable"> 
                <tbody>
                    {/* Headers */}
                    <tr id={"CategoryOptionsRow"}
                            className="categoryTableElement categoryTableHeader">
                        <td id={"CategoryOptionName"}>
                            {chrome.i18n.getMessage("category")}
                        </td>

                        <td id={"CategorySkreativKipOption"}
                            className="skreativKipOption">
                            {chrome.i18n.getMessage("skreativKipOption")}
                        </td>

                        <td id={"CategoryColorOption"}
                            className="colorOption">
                            {chrome.i18n.getMessage("seekreativKBarColor")}
                        </td>

                        <td id={"CategoryPreviewColorOption"}
                            className="previewColorOption">
                            {chrome.i18n.getMessage("previewColor")}
                        </td>
                    </tr>

                    {this.getCategorySkreativKipOptions()}
                </tbody> 
            </table>
        );
    }

    getCategorySkreativKipOptions(): JSX.Element[] {
        const elements: JSX.Element[] = [];

        for (const category of CompileConfig.categoryList) {
            elements.push(
                <CategorySkreativKipOptionsComponent category={category}
                    kreativKey={category}>
                </CategorySkreativKipOptionsComponent>
            );
        }

        return elements;
    }
}

export default CategoryChooserComponent;