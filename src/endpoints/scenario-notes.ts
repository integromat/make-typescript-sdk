import type { FetchFunction } from '../types.js';

/**
 * User attribution attached to a scenario note. The API enriches notes with the author's
 * public profile instead of a bare user ID. An empty object is returned in
 * {@link ScenarioNote.updatedByUser} when the note has never been edited.
 */
export type ScenarioNoteUser = {
    /** Unique identifier of the user */
    id: number;
    /** Display name of the user */
    name: string;
    /** Email address of the user */
    email: string;
};

/**
 * Presentation metadata of a scenario note.
 *
 * The published OpenAPI spec declares `metadata` as a bare object, but the API validates it
 * against exactly these two optional properties and rejects anything else, so it is typed here
 * as the closed shape the endpoint actually accepts.
 */
export type ScenarioNoteMetadata = {
    /** Position of the note on the scenario canvas */
    canvasPosition?: {
        /** Horizontal coordinate on the canvas */
        x: number;
        /** Vertical coordinate on the canvas */
        y: number;
    };
    /** Colour of the note as a CSS colour string, for example `#9138FE` */
    color?: string;
};

/**
 * Represents a note attached to a scenario in Make.
 *
 * Notes are scenario-scoped annotations. A note can float freely on the canvas or be anchored to
 * one or more modules via {@link ScenarioNote.moduleIds}. Notes are always addressed through their
 * parent scenario; there is no team- or organization-wide notes collection.
 */
export type ScenarioNote = {
    /** Unique identifier of the note */
    id: number;
    /** ID of the scenario the note belongs to */
    scenarioId: number;
    /** IDs of the scenario modules the note is anchored to. Empty when the note is not anchored */
    moduleIds: number[];
    /** Presentation metadata of the note */
    metadata: ScenarioNoteMetadata;
    /** Content of the note as the HTML the API stores (sanitized server-side) */
    content: string;
    /** Timestamp when the note was created */
    created: string;
    /** Timestamp when the note was last updated, or `null` when never updated */
    updated: string | null;
    /** Whether the note documents a filter rather than a module */
    isFilterNote: boolean;
    /** Profile of the user who created the note */
    createdByUser: ScenarioNoteUser;
    /** Profile of the user who last updated the note. An empty object when never updated */
    updatedByUser: Partial<ScenarioNoteUser>;
};

/**
 * Parameters for creating a new scenario note. Every property is optional; posting an empty body
 * creates an empty note.
 */
export type CreateScenarioNoteBody = {
    /** Content of the note as HTML. Stored as given (after server-side sanitization) */
    content?: string;
    /** IDs of the scenario modules to anchor the note to */
    moduleIds?: number[];
    /** Presentation metadata of the note */
    metadata?: ScenarioNoteMetadata;
    /** Whether the note documents a filter rather than a module */
    isFilterNote?: boolean;
};

/**
 * Parameters for updating a scenario note. Any property that is not provided is left unchanged.
 */
export type UpdateScenarioNoteBody = {
    /** New content of the note as HTML */
    content?: string;
    /** New set of module IDs the note is anchored to. Replaces the existing set */
    moduleIds?: number[];
    /** New presentation metadata of the note. Replaces the existing metadata */
    metadata?: ScenarioNoteMetadata;
    /** Whether the note documents a filter rather than a module */
    isFilterNote?: boolean;
};

/**
 * A single note update within a batch request.
 */
export type BatchScenarioNotesUpdate = UpdateScenarioNoteBody & {
    /** ID of the note to update */
    id: number;
};

/**
 * Parameters for applying several note changes to a scenario in one request. All three action
 * arrays are required by the API; pass an empty array for the actions you do not need.
 */
export type BatchScenarioNotesBody = {
    /** Notes to create */
    create: CreateScenarioNoteBody[];
    /** Notes to update, each identified by its ID */
    update: BatchScenarioNotesUpdate[];
    /** IDs of the notes to delete */
    delete: number[];
    /** ID of the scenario version the batch applies to */
    scenarioVersionId?: number;
};

/**
 * Outcome of a batch note request.
 */
export type BatchScenarioNotesResult = {
    /** The notes that were created */
    created: ScenarioNote[];
    /** The notes that were updated */
    updated: ScenarioNote[];
    /** IDs of the notes that were deleted */
    deleted: number[];
};

/**
 * Response format for listing scenario notes.
 */
type ListScenarioNotesResponse = {
    /** The scenario's notes, sorted by ID in descending order */
    notes: ScenarioNote[];
};

/**
 * Response format for getting, creating or updating a single scenario note.
 */
type ScenarioNoteResponse = {
    /** The requested, created or updated note */
    note: ScenarioNote;
};

/**
 * Response format for deleting a scenario note.
 */
type DeleteScenarioNoteResponse = {
    /** ID of the deleted note */
    id: number;
};

/**
 * Class providing methods for working with scenario notes.
 *
 * Every method is scoped by the parent scenario ID. The `teamId` and `organizationId` query
 * parameters documented for these endpoints are never read by the API, so they are not offered.
 */
export class ScenarioNotes {
    readonly #fetch: FetchFunction;

    /** @internal */
    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List all notes of a scenario.
     * @param scenarioId The scenario ID to list notes for
     * @returns The scenario's notes, sorted by ID in descending order
     */
    async list(scenarioId: number): Promise<ScenarioNote[]> {
        const response = await this.#fetch<ListScenarioNotesResponse>(`/scenarios/${scenarioId}/notes`);
        return response.notes;
    }

    /**
     * Get a single scenario note.
     * @param scenarioId The scenario ID the note belongs to
     * @param noteId The note ID to get
     * @returns The requested note
     */
    async get(scenarioId: number, noteId: number): Promise<ScenarioNote> {
        const response = await this.#fetch<ScenarioNoteResponse>(`/scenarios/${scenarioId}/notes/${noteId}`);
        return response.note;
    }

    /**
     * Create a new note in a scenario.
     * @param scenarioId The scenario ID to create the note in
     * @param body The note to create
     * @returns The created note
     */
    async create(scenarioId: number, body: CreateScenarioNoteBody = {}): Promise<ScenarioNote> {
        const response = await this.#fetch<ScenarioNoteResponse>(`/scenarios/${scenarioId}/notes`, {
            method: 'POST',
            body,
        });
        return response.note;
    }

    /**
     * Update a scenario note. Any property that is not provided is left unchanged.
     * @param scenarioId The scenario ID the note belongs to
     * @param noteId The note ID to update
     * @param body The properties to update
     * @returns The updated note
     */
    async update(scenarioId: number, noteId: number, body: UpdateScenarioNoteBody): Promise<ScenarioNote> {
        const response = await this.#fetch<ScenarioNoteResponse>(`/scenarios/${scenarioId}/notes/${noteId}`, {
            method: 'PATCH',
            body,
        });
        return response.note;
    }

    /**
     * Delete a scenario note.
     * @param scenarioId The scenario ID the note belongs to
     * @param noteId The note ID to delete
     * @returns ID of the deleted note
     */
    async delete(scenarioId: number, noteId: number): Promise<number> {
        const response = await this.#fetch<DeleteScenarioNoteResponse>(`/scenarios/${scenarioId}/notes/${noteId}`, {
            method: 'DELETE',
        });
        return response.id;
    }

    /**
     * Create, update and delete several notes of a scenario in one request.
     * @param scenarioId The scenario ID to apply the changes to
     * @param body The notes to create, update and delete
     * @returns The created and updated notes and the IDs of the deleted ones
     */
    async batch(scenarioId: number, body: BatchScenarioNotesBody): Promise<BatchScenarioNotesResult> {
        const response = await this.#fetch<BatchScenarioNotesResult>(`/scenarios/${scenarioId}/notes/batch`, {
            method: 'POST',
            body,
        });
        return {
            created: response.created,
            updated: response.updated,
            deleted: response.deleted,
        };
    }
}
