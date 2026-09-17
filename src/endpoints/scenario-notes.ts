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
    /** Unique identifier of the note. A numeric string, because the API serializes this 64-bit ID as text */
    id: string;
    /** ID of the scenario the note belongs to */
    scenarioId: number;
    /** IDs of the scenario modules the note is anchored to. Empty when the note is not anchored */
    moduleIds: number[];
    /** Presentation metadata of the note */
    metadata: ScenarioNoteMetadata;
    /** Content of the note as HTML, sanitized server-side. See {@link ScenarioNotes} on the content format */
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
    /** Content of the note as HTML, for example `<p>text</p>`. Markdown is not rendered — see {@link ScenarioNotes} */
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
    /** New content of the note as HTML. Markdown is not rendered — see {@link ScenarioNotes} */
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
 *
 * Unlike {@link ScenarioNotes.update}, the batch route replaces rather than merges: an omitted
 * `content` clears the content and omitted `moduleIds` unanchor the note, so both are required
 * here to make that loss impossible by accident. `metadata` and `isFilterNote` are preserved when
 * omitted and stay optional.
 */
export type BatchScenarioNotesUpdate = {
    /** ID of the note to update */
    id: string;
    /**
     * Content of the note as HTML. Required: the batch route clears the content when it is absent.
     * Markdown is not rendered — see {@link ScenarioNotes}
     */
    content: string;
    /** Module IDs the note is anchored to. Required: the batch route unanchors the note when absent */
    moduleIds: number[];
    /** New presentation metadata. Left unchanged when omitted */
    metadata?: ScenarioNoteMetadata;
    /** Whether the note documents a filter. Left unchanged when omitted */
    isFilterNote?: boolean;
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
    delete: string[];
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
    deleted: string[];
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
    id: string;
};

/**
 * Class providing methods for working with scenario notes.
 *
 * Every method is scoped by the parent scenario ID. The `teamId` and `organizationId` query
 * parameters documented for these endpoints are never read by the API, so they are not offered.
 *
 * ## Note content must be HTML
 *
 * `content` is stored and rendered as HTML. The API keeps whatever string it is given, minus any
 * tags the server-side sanitizer strips, and performs no Markdown conversion — Markdown syntax
 * therefore survives the round trip untouched and shows up on the scenario canvas as the literal
 * characters `###`, `**` and `` ` `` rather than as formatting. Send HTML:
 *
 * ```ts
 * // Renders as a heading, bold text and a list
 * await make.scenarioNotes.create(scenarioId, {
 *     content: '<h3>Title</h3><p>Some <strong>bold</strong> text</p><ul><li>item</li></ul>',
 * });
 *
 * // Renders as the raw characters, not as formatting
 * await make.scenarioNotes.create(scenarioId, {
 *     content: '### Title\n\nSome **bold** text\n\n- item',
 * });
 * ```
 *
 * Converting Markdown (or anything else) to HTML is the caller's job; this SDK passes `content`
 * through unchanged in both directions.
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
    async get(scenarioId: number, noteId: string): Promise<ScenarioNote> {
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
    async update(scenarioId: number, noteId: string, body: UpdateScenarioNoteBody): Promise<ScenarioNote> {
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
    async delete(scenarioId: number, noteId: string): Promise<string> {
        const response = await this.#fetch<DeleteScenarioNoteResponse>(`/scenarios/${scenarioId}/notes/${noteId}`, {
            method: 'DELETE',
        });
        return response.id;
    }

    /**
     * Create, update and delete several notes of a scenario in one request.
     *
     * This route is not a batched equivalent of the single-note methods. Entries in `create` are
     * sent with an empty `metadata` object when none is given, because the route stores the value
     * verbatim and fails with a server error when it is absent. Entries in `update` replace rather
     * than merge, which is why {@link BatchScenarioNotesUpdate} requires `content` and `moduleIds`.
     * @param scenarioId The scenario ID to apply the changes to
     * @param body The notes to create, update and delete
     * @returns The created and updated notes and the IDs of the deleted ones
     */
    async batch(scenarioId: number, body: BatchScenarioNotesBody): Promise<BatchScenarioNotesResult> {
        const response = await this.#fetch<BatchScenarioNotesResult>(`/scenarios/${scenarioId}/notes/batch`, {
            method: 'POST',
            body: {
                ...body,
                // The batch route inserts `metadata` verbatim, so an entry without it fails with a
                // 500 instead of defaulting to an empty object the way single-note creation does.
                create: body.create.map(note => ({ ...note, metadata: note.metadata ?? {} })),
            },
        });
        return {
            created: response.created,
            updated: response.updated,
            deleted: response.deleted,
        };
    }
}
