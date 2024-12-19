import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock the global fetch function to simulate API responses
global.fetch = jest.fn();

describe('App Component', () => {
  afterEach(() => {
    fetch.mockClear(); // Clear the mock after each test
  });

  test('should render loading state initially', () => {
    render(<App />);
    expect(screen.getByText(/Loading data.../i)).toBeInTheDocument();
  });

  test('should display data when API call is successful', async () => {
    // Simulate a successful API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { "percentage.funded": "75%", "amt.pledged": "$5000" },
        { "percentage.funded": "50%", "amt.pledged": "$3000" },
      ],
    });

    render(<App />);

    // Wait for the table to appear
    await waitFor(() => screen.getByText(/S.No./i));

    expect(screen.getByText("S.No.")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("$5000")).toBeInTheDocument();
  });

  test('should display error message when API call fails', async () => {
    // Simulate a failed API response
    fetch.mockRejectedValueOnce(new Error('Failed to fetch data.'));

    render(<App />);

    // Wait for the error message
    await waitFor(() => screen.getByText(/Error: Failed to fetch data./i));

    expect(screen.getByText(/Error: Failed to fetch data./i)).toBeInTheDocument();
  });

  test('should paginate correctly', async () => {
    // Simulate successful API response with multiple pages of data
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { "percentage.funded": "75%", "amt.pledged": "$5000" },
        { "percentage.funded": "50%", "amt.pledged": "$3000" },
        { "percentage.funded": "40%", "amt.pledged": "$2000" },
        { "percentage.funded": "60%", "amt.pledged": "$4000" },
        { "percentage.funded": "85%", "amt.pledged": "$7000" },
        { "percentage.funded": "30%", "amt.pledged": "$1000" },
      ],
    });

    render(<App />);

    // Wait for the table to load
    await waitFor(() => screen.getByText("S.No."));

    // Check the first page
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();

    // Simulate clicking the "Next" button to go to the next page
    fireEvent.click(screen.getByText(/Next/i));

    // Wait for the new page data to load
    await waitFor(() => screen.getByText("6"));

    // Check the second page
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();
  });

  test('should disable Previous button on the first page', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { "percentage.funded": "75%", "amt.pledged": "$5000" },
        { "percentage.funded": "50%", "amt.pledged": "$3000" },
      ],
    });

    render(<App />);

    await waitFor(() => screen.getByText("S.No."));

    const previousButton = screen.getByText(/Previous/i);
    expect(previousButton).toBeDisabled();
  });

  test('should disable Next button on the last page', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { "percentage.funded": "75%", "amt.pledged": "$5000" },
        { "percentage.funded": "50%", "amt.pledged": "$3000" },
        { "percentage.funded": "40%", "amt.pledged": "$2000" },
        { "percentage.funded": "60%", "amt.pledged": "$4000" },
        { "percentage.funded": "85%", "amt.pledged": "$7000" },
      ],
    });

    render(<App />);

    await waitFor(() => screen.getByText("S.No."));

    const nextButton = screen.getByText(/Next/i);
    expect(nextButton).toBeDisabled();
  });
});
