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
                className="categoryChooserTable"> <tbody>
                {this.getCategorySkreativKipOptions()}
            </tbody> </table>
        );
    }

    getCategorySkreativKipOptions(): JSX.Element[] {
        let elements: JSX.Element[] = [];

        for (const category of CompileConfig.categoryList) {
            elements.push(
                <CategorySkreativKipOptionsComponent category={category}
                    defaultColor={"00d400"}>
                </CategorySkreativKipOptionsComponent>
            );
        }

        return elements;
    }
}

export default CategoryChooserComponent;