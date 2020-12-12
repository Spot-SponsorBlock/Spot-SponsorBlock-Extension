import * as React from "react";

import Config from "../config"
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

    render() {
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

                        <td id={"CategorySkreativKipOption"}>
                            {chrome.i18n.getMessage("skreativKipOption")}
                        </td>

                        <td id={"CategoryColorOption"}>
                            {chrome.i18n.getMessage("seekreativKBarColor")}
                        </td>

                        <td id={"CategoryPreviewColorOption"}>
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