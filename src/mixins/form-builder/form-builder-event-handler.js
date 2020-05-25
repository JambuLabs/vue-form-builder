/**
 * [Note] Do not use this mixin for other purpose. This is where I move all the code of FormBuilder to keep easy to:
 *  - Structuring
 *  - Refactoring
 *  - ...
 *  This file will be handled all the Event (mostly listening) from the children to update the big `formData`
 *  @author Phat Tran <phattranminh96@gmail.com>
 */
import {EVENT_CONSTANTS} from "@/configs/events";
import {HELPER} from "@/libraries/helper";


const FORM_BUILDER_EVENT_HANDLER = {
    methods: {
        /**
         * Do mapping for section after row added
         * @param sectionId
         * @param rowId
         */
        sectionAndRowMapping(sectionId, rowId) {
            // push it into the section Rows...
            // I can ensure that sectionId is exists to be retrieve
            this.formData.sections[sectionId].rows.push(rowId)
        },

        /**
         * Push-up section (SORT)
         * @param sectionObj
         * @param {Number} type
         *  - 0 => Up
         *  - 1 => Down
         */
        sectionPushedUp(sectionObj, type = 0) {
            if (
                // sort == 0 and push up => stop
                (sectionObj.sortOrder <= 1 && type === 0)
                ||
                // sort == total_sections and push down => stop
                (sectionObj.sortOrder === this.sortedSections.length && type === 1)
            ) {
                return
            }

            // old sort order to exchange with the upper section
            let postSortOrder = sectionObj.sortOrder;

            // pick section from sort order - Sort Order is unique
            let preSectionOrder = (type === 0) ? (postSortOrder - 1) : (postSortOrder + 1)
            let preSection = HELPER.find(this.formData.sections, "sortOrder", preSectionOrder)

            // swap now
            this.$set(this.formData.sections[sectionObj.uniqueId], 'sortOrder', preSectionOrder)
            this.$set(this.formData.sections[preSection.uniqueId], 'sortOrder', postSortOrder)

            // Sort Again After Swapped Order
            this.doSortSection()
        },

        /**
         * Delete a section
         * @param sectionId
         */
        sectionDelete(sectionId) {
            // validate input
            if (!this.formData.sections[sectionId]) {
                return
            }

            // need to delete all the related control & row
            let sectionObj = this.formData.sections[sectionId];
            sectionObj.rows.forEach(rowId => {

                // delete inner control of the rows
                let rowItem = this.formData.rows[rowId]
                rowItem.controls.forEach(controlId => {
                    // delete control by ID :D
                    this.$delete(this.formData.controls, controlId)
                });

                // delete this rows.
                this.$delete(this.formData.rows, rowItem.uniqueId)
            })

            // delete ($delete to reactive)
            this.$delete(this.formData.sections, sectionId)

            // Sort Again After Deleted
            this.doSortSection()
        },

        /**
         * Added new row
         * @param rowObject
         */
        rowNewAdded(rowObject) {
            this.formData.rows[rowObject.uniqueId] = rowObject
        }
    },

    created() {
        // section events
        this.$formEvent.$on(EVENT_CONSTANTS.BUILDER.SECTION.ADDED_ROW, this.sectionAndRowMapping)
        this.$formEvent.$on(EVENT_CONSTANTS.BUILDER.SECTION.PUSH, this.sectionPushedUp)
        this.$formEvent.$on(EVENT_CONSTANTS.BUILDER.SECTION.DELETE, this.sectionDelete)

        // row events
        this.$formEvent.$on(EVENT_CONSTANTS.BUILDER.ROW.CREATE, this.rowNewAdded)

        // control events
    }
}

export {
    FORM_BUILDER_EVENT_HANDLER
}